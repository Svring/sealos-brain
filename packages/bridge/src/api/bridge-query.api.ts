"use server";

import { getResource, listResources } from "@sealos-brain/k8s/shared/api";
import type {
	K8sContext,
	K8sResource,
	ResourceTarget,
} from "@sealos-brain/k8s/shared/models";
import { k8sParser } from "@sealos-brain/k8s/shared/utils";
import type { BridgeQueryItem } from "#models/bridge-query.model";
import {
	createResourceLocatorKey,
	extractDataFromResources,
	filterResourcesByName,
	parseFieldDescriptions,
	reconstructArrayResults,
} from "#utils/bridge-query.utils";

// ============================================================================
// RESOURCE FETCHING FUNCTIONS
// ============================================================================

/**
 * Processes a single field value to get the corresponding resource
 */
async function getResourceByFieldValue(
	context: K8sContext,
	fieldValue: BridgeQueryItem,
	instanceName: string,
): Promise<K8sResource | K8sResource[] | K8sContext | null> {
	if (fieldValue.resourceType === "external") {
		return null;
	}

	// Handle context resource type
	if (fieldValue.resourceType === "context") {
		return context;
	}

	// Try exact name fetch first if possible
	if (fieldValue.name) {
		const exactNameMatch = fieldValue.name.replace(
			/\{\{instanceName\}\}/g,
			instanceName,
		);
		// Check if it's a plain name (no regex)
		if (!/[.*+?^${}()|[\]\\]/.test(exactNameMatch)) {
			try {
				const target = k8sParser.fromTypeToTarget(
					fieldValue.resourceType,
					exactNameMatch,
				);
				return await getResource(context, target as ResourceTarget);
			} catch {
				// Fall through to other strategies
			}
		}
	}

	// Use label selector if available
	if (fieldValue.label) {
		const target = k8sParser.fromTypeToTarget(
			fieldValue.resourceType,
			instanceName,
			fieldValue.label,
		);
		const result = await listResources(context, target);
		const resources = result.items || [];

		// Filter by name pattern if specified
		const filteredResources = fieldValue.name
			? filterResourcesByName(resources, fieldValue.name, instanceName)
			: resources;

		// If no path or empty path, return the list
		if (
			!fieldValue.path ||
			(Array.isArray(fieldValue.path) && fieldValue.path.length === 0) ||
			(Array.isArray(fieldValue.path) &&
				fieldValue.path.length === 1 &&
				fieldValue.path[0] === "")
		) {
			return filteredResources;
		}

		// Otherwise, expect single resource
		if (filteredResources.length > 1) {
			throw new Error(
				`Multiple resources ${
					fieldValue.name
						? `matched the pattern ${fieldValue.name}`
						: `found for label ${fieldValue.label}`
				}. Only one resource is allowed.`,
			);
		}

		return filteredResources[0] || null;
	}

	// Use name pattern without label
	if (fieldValue.name) {
		const target = k8sParser.fromTypeToTarget(fieldValue.resourceType);
		const result = await listResources(context, target);
		const resources = result.items || [];

		const filteredResources = filterResourcesByName(
			resources,
			fieldValue.name,
			instanceName,
		);

		// If no path or empty path, return the list
		if (
			!fieldValue.path ||
			(Array.isArray(fieldValue.path) && fieldValue.path.length === 0) ||
			(Array.isArray(fieldValue.path) &&
				fieldValue.path.length === 1 &&
				fieldValue.path[0] === "")
		) {
			return filteredResources;
		}

		// Otherwise, expect single resource
		if (filteredResources.length > 1) {
			throw new Error(
				`Multiple resources matched the pattern ${fieldValue.name}. Only one resource is allowed.`,
			);
		}

		return filteredResources[0] || null;
	}

	// Fall back to exact name match using instanceName
	try {
		const target = k8sParser.fromTypeToTarget(
			fieldValue.resourceType,
			instanceName,
		);
		return await getResource(context, target as ResourceTarget);
	} catch {
		return null;
	}
}

/**
 * Fetches resources for multiple schema descriptions with caching to avoid redundant API calls
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic schema processing
async function getResourcesByFieldDescriptions(
	context: K8sContext,
	// biome-ignore lint/suspicious/noExplicitAny: Generic schema processing
	schemaDescriptions: Record<string, any>,
	instanceName: string,
	// biome-ignore lint/suspicious/noExplicitAny: Generic schema processing
): Promise<Record<string, any>> {
	// biome-ignore lint/suspicious/noExplicitAny: Generic schema processing
	const flattenedDescriptions: Record<
		string,
		BridgeQueryItem | BridgeQueryItem[]
	> = {};

	// Flatten descriptions
	function flatten(obj: Record<string, unknown>, prefix = "") {
		for (const [key, value] of Object.entries(obj)) {
			const fullKey = prefix ? `${prefix}.${key}` : key;
			if (value && typeof value === "object" && "resourceType" in value) {
				flattenedDescriptions[fullKey] = value as BridgeQueryItem;
			} else if (value && typeof value === "object" && !Array.isArray(value)) {
				flatten(value as Record<string, unknown>, fullKey);
			} else if (Array.isArray(value)) {
				// Handle arrays of resources (e.g., ssh, connection fields)
				flattenedDescriptions[fullKey] = value as BridgeQueryItem[];
			}
		}
	}
	flatten(schemaDescriptions as Record<string, unknown>);

	// biome-ignore lint/suspicious/noExplicitAny: Generic schema processing
	const entries: [string, BridgeQueryItem | BridgeQueryItem[]][] =
		Object.entries(flattenedDescriptions);

	// Cache to store fetched resources by their locator key (includes K8sResource, K8sContext, etc.)
	const resourceCache = new Map<
		string,
		K8sResource | K8sResource[] | K8sContext | null
	>();

	// biome-ignore lint/suspicious/noExplicitAny: Generic resource mapping
	const results: Record<string, any> = {};

	// Process entries to fetch resources
	for (const [fieldName, description] of entries) {
		if (Array.isArray(description)) {
			// Handle array of resources (e.g., ssh field with multiple resources)
			const resourcePromises = description.map(async (item) => {
				const locatorKey = createResourceLocatorKey(item, instanceName);

				// Check cache first
				if (resourceCache.has(locatorKey)) {
					return resourceCache.get(locatorKey);
				}

				// Fetch resource
				const resource = await getResourceByFieldValue(
					context,
					item,
					instanceName,
				);

				resourceCache.set(locatorKey, resource);
				return resource;
			});

			// Store array of resources for this field
			results[fieldName] = await Promise.all(resourcePromises);
		} else {
			// Handle single resource
			const locatorKey = createResourceLocatorKey(description, instanceName);

			// Check cache first
			if (resourceCache.has(locatorKey)) {
				results[fieldName] = resourceCache.get(locatorKey);
			} else {
				const resource = await getResourceByFieldValue(
					context,
					description,
					instanceName,
				);
				resourceCache.set(locatorKey, resource);
				results[fieldName] = resource;
			}
		}
	}

	return results;
}

// ============================================================================
// MAIN COMPOSITION FUNCTION
// ============================================================================

/**
 * Composes an object from a target by determining the appropriate schema and parsing its descriptions
 */
export async function composeObjectFromTarget(
	context: K8sContext,
	target: ResourceTarget,
	// biome-ignore lint/suspicious/noExplicitAny: Generic schema processing
	metaSchema: any,
	// biome-ignore lint/suspicious/noExplicitAny: Generic schema processing
	transformSchema: any,
	// biome-ignore lint/suspicious/noExplicitAny: Generic schema processing
	objectSchema: any,
	// biome-ignore lint/suspicious/noExplicitAny: Generic schema processing
): Promise<any> {
	if (!target.name) {
		throw new Error(
			`Instance name is required in target: ${JSON.stringify(target)}`,
		);
	}

	const schemaDescriptions = parseFieldDescriptions(metaSchema);

	const resources = await getResourcesByFieldDescriptions(
		context,
		schemaDescriptions,
		target.name,
	);

	const resourceEntries = Object.entries(resources);

	const extractedData = extractDataFromResources(
		resourceEntries,
		schemaDescriptions,
	);

	// Reconstruct array results from indexed fields
	const reconstructedData = reconstructArrayResults(extractedData);

	// Apply Zod schema parsing to handle transforms and validation (supports async transforms)
	try {
		const parsedData = await transformSchema.parseAsync(reconstructedData);
		return objectSchema.parse(parsedData);
	} catch (error) {
		console.warn("Schema parsing failed, returning raw extracted data:", error);
		return reconstructedData;
	}
}
