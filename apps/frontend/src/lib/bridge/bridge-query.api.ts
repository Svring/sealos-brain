"use server";

import type { z } from "zod";
import { k8sParser } from "@/lib/k8s/k8s.parser";
import { getResource, listResources } from "@/lib/k8s/k8s-service.api";
import type { BridgeQueryItem } from "@/mvvm/bridge/models/bridge-query.model";
import type { ResourceTarget } from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import type { K8sResource } from "@/mvvm/k8s/models/k8s-resource.model";
import {
	createResourceLocatorKey,
	extractDataFromResources,
	filterResourcesByName,
	parseFieldDescriptions,
	reconstructArrayResults,
} from "./bridge-query.utils";

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
	const flattenedDescriptions: Record<string, BridgeQueryItem> = {};

	// Flatten descriptions
	function flatten(obj: Record<string, unknown>, prefix = "") {
		for (const [key, value] of Object.entries(obj)) {
			const fullKey = prefix ? `${prefix}.${key}` : key;
			if (value && typeof value === "object" && "resourceType" in value) {
				flattenedDescriptions[fullKey] = value as BridgeQueryItem;
			} else if (value && typeof value === "object" && !Array.isArray(value)) {
				flatten(value as Record<string, unknown>, fullKey);
			}
		}
	}
	flatten(schemaDescriptions as Record<string, unknown>);

	const entries = Object.entries(flattenedDescriptions);

	// Cache to store fetched resources by their locator key (includes K8sResource, K8sContext, etc.)
	const resourceCache = new Map<
		string,
		K8sResource | K8sResource[] | K8sContext | null
	>();

	// Group fields by their resource locator to identify duplicates
	const fieldsByLocator = new Map<string, string[]>();

	for (const [fieldName, description] of entries) {
		const locatorKey = createResourceLocatorKey(description, instanceName);
		if (!fieldsByLocator.has(locatorKey)) {
			fieldsByLocator.set(locatorKey, []);
		}
		const fields = fieldsByLocator.get(locatorKey);
		if (fields) {
			fields.push(fieldName);
		}
	}

	// Fetch resources only once per unique locator
	const uniqueLocators = Array.from(fieldsByLocator.keys());
	const fetchPromises = uniqueLocators.map(async (locatorKey) => {
		// Get the first field with this locator to extract the description
		const fields = fieldsByLocator.get(locatorKey);
		if (!fields || fields.length === 0) return [locatorKey, null] as const;
		const firstFieldName = fields[0];
		if (!firstFieldName) return [locatorKey, null] as const;
		const description = flattenedDescriptions[firstFieldName];
		if (!description) return [locatorKey, null] as const;

		const resource = await getResourceByFieldValue(
			context,
			description,
			instanceName,
		);

		resourceCache.set(locatorKey, resource);
		return [locatorKey, resource] as const;
	});

	await Promise.all(fetchPromises);

	// Map each field to its corresponding cached resource
	// biome-ignore lint/suspicious/noExplicitAny: Generic resource mapping
	const results: Record<string, any> = {};
	for (const [fieldName, description] of entries) {
		const locatorKey = createResourceLocatorKey(description, instanceName);
		results[fieldName] = resourceCache.get(locatorKey);
	}

	return results;
}

// ============================================================================
// MAIN COMPOSITION FUNCTION
// ============================================================================

/**
 * Composes an object from a target by determining the appropriate schema and parsing its descriptions
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic schema processing
export async function composeObjectFromTarget(
	context: K8sContext,
	target: ResourceTarget,
	// biome-ignore lint/suspicious/noExplicitAny: Generic schema processing
	bridgeSchema: z.ZodObject<any>,
	objectSchema: z.ZodObject<any>,
	// biome-ignore lint/suspicious/noExplicitAny: Generic schema processing
): Promise<any> {
	if (!target.name) {
		throw new Error(
			`Instance name is required in target: ${JSON.stringify(target)}`,
		);
	}

	const schemaDescriptions = parseFieldDescriptions(bridgeSchema);

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
		const parsedData = await bridgeSchema.parseAsync(reconstructedData);
		return objectSchema.parse(parsedData);
	} catch (error) {
		console.warn("Schema parsing failed, returning raw extracted data:", error);
		return reconstructedData;
	}
}
