import type { K8sResource } from "@sealos-brain/k8s/shared/models";
import type { BridgeQueryItem } from "@sealos-brain/models/bridge";
import _ from "lodash";
import { z } from "zod";

// ============================================================================
// CORE UTILITY FUNCTIONS
// ============================================================================

/**
 * Parses a JSON string description from a schema field
 */
export function parseFieldDescription(
	description: string,
): BridgeQueryItem | BridgeQueryItem[] {
	return JSON.parse(description);
}

/**
 * Try to resolve a name pattern to an exact name. If the pattern becomes a plain
 * string (no regex meta) after replacing {{instanceName}}, return it. Otherwise null.
 */
function deriveExactNameFromPattern(
	rawNamePattern: string,
	instanceName: string,
): string | null {
	const replaced = rawNamePattern.replace(
		/\{\{instanceName\}\}/g,
		instanceName,
	);

	// Support optional anchors ^...$
	const anchored = replaced.match(/^\^(.*)\$$/);
	const candidate = anchored?.[1] ?? replaced;

	// Contains regex meta? If so, not exact
	if (/[.*+?^${}()|[\]\\]/.test(candidate)) return null;
	return candidate;
}

/**
 * Extracts data from any object based on the specified path
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic data extraction utility
export function extractDataFromObject(data: any, path: string[]): any {
	if (!data || !path?.length) return null;
	if (path.length === 1) {
		// Handle empty string path to return the object directly
		if (path[0] === "") return data;
		const firstPath = path[0];
		if (!firstPath) return null;
		return _.get(data, firstPath, null);
	}

	return _.chain(path)
		.reduce((current, segment, i) => {
			if (current === null) return null;
			const isLastSegment = i === path.length - 1;

			if (Array.isArray(current)) {
				return isLastSegment
					? _.filter(
							_.map(current, (item) => _.get(item, segment, null)),
							(item) => item !== null,
						)
					: _.flatMap(
							_.filter(
								_.map(current, (item) => _.get(item, segment, null)),
								(item) => item !== null,
							),
						);
			}

			const next = _.get(current, segment, null);
			return next === null ? null : Array.isArray(next) ? next : [next];
		}, data)
		.thru((result) =>
			Array.isArray(result) && result.length
				? _.filter(result, (item) => item !== null)
				: null,
		)
		.value();
}

// ============================================================================
// SCHEMA PROCESSING FUNCTIONS
// ============================================================================

/**
 * Parses a Zod schema and extracts description options for all fields
 */
// biome-ignore lint/suspicious/noExplicitAny: Schema parsing utility
export function parseFieldDescriptions(schema: z.ZodObject<any>): any {
	const shape = schema instanceof z.ZodObject ? schema.shape : {};
	const result: Record<string, unknown> = {};

	for (const [key, zodValue] of Object.entries(shape)) {
		const descriptionValue = _.get(zodValue, "_def.description");
		const description = descriptionValue
			? _.attempt(() => parseFieldDescription(descriptionValue as string))
			: new Error("No description");

		let nestedResult = {};
		if (zodValue instanceof z.ZodObject) {
			nestedResult = parseFieldDescriptions(zodValue);
		} else if (
			zodValue instanceof z.ZodArray &&
			zodValue.element instanceof z.ZodObject
		) {
			nestedResult = {
				_isArray: true,
				...parseFieldDescriptions(zodValue.element),
			};
		}

		// Handle array descriptions - expand them with indexed keys
		if (!_.isError(description) && Array.isArray(description)) {
			const expandedDescription: Record<string, unknown> = {};
			// biome-ignore lint/suspicious/noExplicitAny: Schema description processing
			description.forEach((desc: any, index: number) => {
				expandedDescription[`${key}_${index}`] = desc;
			});

			Object.assign(result, expandedDescription);
			if (!_.isEmpty(nestedResult)) {
				result[key] = nestedResult;
			}
		} else {
			result[key] = {
				...(_.isError(description) ? {} : (description as object)),
				...(_.isEmpty(nestedResult) ? {} : nestedResult),
			};
		}
	}

	return result;
}

/**
 * Flattens nested schema descriptions to get only leaf nodes with resourceType
 */
function flattenFieldDescriptions(
	schemaDescriptions: Record<string, unknown>,
	prefix = "",
): Record<string, BridgeQueryItem> {
	const result: Record<string, BridgeQueryItem> = {};

	for (const [key, value] of Object.entries(schemaDescriptions)) {
		const fullKey = prefix ? `${prefix}.${key}` : key;
		if (_.isObject(value) && !_.isArray(value)) {
			if (_.has(value, "resourceType")) {
				result[fullKey] = value as BridgeQueryItem;
			} else {
				Object.assign(
					result,
					flattenFieldDescriptions(value as Record<string, unknown>, fullKey),
				);
			}
		}
	}

	return result;
}

// ============================================================================
// RESOURCE LOCATOR FUNCTIONS
// ============================================================================

/**
 * Creates a unique cache key for a resource locator
 */
export function createResourceLocatorKey(
	fieldValue: BridgeQueryItem,
	instanceName: string,
): string {
	if (fieldValue.resourceType === "external") {
		return `external:${fieldValue.resourceType}`;
	}

	if (fieldValue.resourceType === "context") {
		return `context:${fieldValue.path?.join(".") || ""}`;
	}

	const parts = [fieldValue.resourceType];

	if (fieldValue.label) {
		parts.push(`label:${fieldValue.label}=${instanceName}`);
	}

	if (fieldValue.name) {
		const exactName = deriveExactNameFromPattern(fieldValue.name, instanceName);
		if (exactName) {
			parts.push(`exactName:${exactName}`);
		} else {
			const namePattern = fieldValue.name.replace(
				/\{\{instanceName\}\}/g,
				instanceName,
			);
			parts.push(`name:${namePattern}`);
		}
	} else if (!fieldValue.label) {
		// Fall back to exact name match
		parts.push(`exact:${instanceName}`);
	}

	return parts.join("|");
}

/**
 * Filters resources by name pattern
 */
export function filterResourcesByName(
	resources: K8sResource[],
	namePattern: string,
	instanceName: string,
): K8sResource[] {
	const exactName = deriveExactNameFromPattern(namePattern, instanceName);
	if (exactName) {
		return resources.filter((resource) => resource.metadata.name === exactName);
	}
	const pattern = namePattern.replace(/\{\{instanceName\}\}/g, instanceName);
	return resources.filter((resource) =>
		new RegExp(pattern).test(resource.metadata.name || ""),
	);
}

// ============================================================================
// DATA EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Sets a nested value in an object using a dot-separated path
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic object manipulation
function setNestedValue(obj: any, path: string, value: any): void {
	const keys = path.split(".");
	let current = obj;
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		if (!key) continue;
		if (i === keys.length - 1) {
			current[key] = value;
		} else {
			current[key] =
				_.isObject(current[key]) && current[key] !== null ? current[key] : {};
			current = current[key];
		}
	}
}

/**
 * Categorizes resource entries into array groups and regular fields
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
function categorizeResourceEntries(
	resourceEntries: [string, any][],
	flattenedDescriptions: Record<string, BridgeQueryItem>,
) {
	const arrayGroups: Record<
		string,
		// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
		{ fieldName: string; description: BridgeQueryItem; resource: any }[]
	> = {};
	// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
	const regularFields: {
		fieldName: string;
		description: BridgeQueryItem;
		resource: any;
	}[] = [];

	for (const [fieldName, resource] of resourceEntries) {
		const description = flattenedDescriptions[fieldName];
		if (!description) continue;

		if (
			description.path &&
			Array.isArray(description.path) &&
			description.path.length >= 2
		) {
			const arrayBasePath = description.path.slice(0, -1).join(".");
			const arrayKey = `${fieldName
				.split(".")
				.slice(0, -1)
				.join(".")}_${arrayBasePath}`;

			if (!arrayGroups[arrayKey]) {
				arrayGroups[arrayKey] = [];
			}
			arrayGroups[arrayKey].push({ fieldName, description, resource });
		} else {
			regularFields.push({ fieldName, description, resource });
		}
	}

	return { arrayGroups, regularFields };
}

/**
 * Processes regular fields and sets their values in the results object
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
function processRegularFields(
	// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
	regularFields: {
		fieldName: string;
		description: BridgeQueryItem;
		resource: any;
	}[],
	// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
	results: Record<string, any>,
): void {
	for (const { fieldName, description, resource } of regularFields) {
		// biome-ignore lint/suspicious/noImplicitAnyLet: Generic value extraction
		let extractedValue;

		// If no path is specified or path is empty/[""], return the resource as-is (list of resources)
		if (
			!description?.path ||
			(Array.isArray(description.path) && description.path.length === 0) ||
			(Array.isArray(description.path) &&
				description.path.length === 1 &&
				description.path[0] === "")
		) {
			extractedValue = resource;
		} else {
			extractedValue = extractDataFromObject(resource, description.path);
		}

		setNestedValue(results, fieldName, extractedValue);
	}
}

/**
 * Processes array groups to combine multiple properties into arrays of objects
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
function processArrayGroups(
	arrayGroups: Record<
		string,
		// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
		{ fieldName: string; description: BridgeQueryItem; resource: any }[]
	>,
	// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
	results: Record<string, any>,
): void {
	for (const fields of Object.values(arrayGroups)) {
		if (_.isEmpty(fields)) continue;

		const firstField = fields[0];
		if (!firstField?.description?.path) continue;

		const arrayBasePath = firstField.description.path.slice(0, -1);
		const arrayData = extractDataFromObject(firstField.resource, arrayBasePath);

		if (_.isArray(arrayData)) {
			// biome-ignore lint/suspicious/noExplicitAny: Generic array data processing
			const combinedArray = _.map(arrayData, (item: any) => {
				const combinedItem: Record<string, unknown> = {};
				for (const { fieldName, description } of fields) {
					const propertyName = description.path
						? _.last(description.path)
						: null;
					if (!propertyName) continue;
					const fieldKey = _.last(fieldName.split(".")) || fieldName;
					combinedItem[fieldKey] = item[propertyName as string];
				}
				return combinedItem;
			});

			const parentFieldName = firstField.fieldName
				.split(".")
				.slice(0, -1)
				.join(".");
			if (parentFieldName) {
				_.set(results, parentFieldName, combinedArray);
			}
		}
	}
}

/**
 * Processes array fields that are marked with _isArray flag
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
function processArrayFields(
	// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
	resourceEntries: [string, any][],
	// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
	schemaDescriptions: Record<string, any>,
	// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
	results: Record<string, any>,
): void {
	// Find array fields in the schema
	for (const [fieldName, fieldSchema] of Object.entries(schemaDescriptions)) {
		if (!_.isObject(fieldSchema) || !_.get(fieldSchema, "_isArray")) continue;

		// Get the resource for this field (should be the same for all sub-fields)
		const resourceEntry = resourceEntries.find(([name]) =>
			name.startsWith(fieldName),
		);
		if (!resourceEntry) continue;

		const [, resource] = resourceEntry;
		if (!resource) continue;

		// Extract the array data from the first path segment
		const subFields = _.omit(fieldSchema, ["_isArray"]);
		const firstSubField = _.head(_.values(subFields));

		if (
			firstSubField &&
			_.get(firstSubField, "path") &&
			Array.isArray(_.get(firstSubField, "path")) &&
			(_.get(firstSubField, "path") as unknown[]).length >= 2
		) {
			const arrayBasePath = (_.get(firstSubField, "path") as string[]).slice(
				0,
				-1,
			);
			const arrayData = extractDataFromObject(resource, arrayBasePath);

			if (_.isArray(arrayData)) {
				const combinedArray = _.map(arrayData, (item) => {
					const combinedItem: Record<string, unknown> = {};

					for (const [subFieldName, subFieldSchema] of Object.entries(
						subFields,
					)) {
						if (_.get(subFieldSchema, "_isArray")) {
							// Handle nested arrays
							const nestedSubFields = _.omit(subFieldSchema, ["_isArray"]);
							const nestedFirstSubField = _.head(_.values(nestedSubFields));

							if (
								nestedFirstSubField &&
								_.get(nestedFirstSubField, "path") &&
								Array.isArray(_.get(nestedFirstSubField, "path")) &&
								(_.get(nestedFirstSubField, "path") as unknown[]).length >= 2
							) {
								const nestedArrayBasePath = (
									_.get(nestedFirstSubField, "path") as string[]
								).slice(0, -1);
								const nestedArrayData = extractDataFromObject(
									item,
									nestedArrayBasePath,
								);

								if (_.isArray(nestedArrayData)) {
									const nestedCombinedArray = _.map(
										nestedArrayData,
										(nestedItem) => {
											const nestedCombinedItem: Record<string, unknown> = {};

											for (const [
												nestedSubFieldName,
												nestedSubFieldSchema,
											] of Object.entries(nestedSubFields)) {
												const nestedPath = _.get(nestedSubFieldSchema, "path");
												if (nestedPath) {
													const nestedPropertyName = _.last(
														nestedPath as string[],
													);
													if (
														nestedPropertyName &&
														typeof nestedPropertyName === "string"
													) {
														nestedCombinedItem[nestedSubFieldName] = _.get(
															nestedItem,
															nestedPropertyName,
															null,
														);
													}
												}
											}

											return nestedCombinedItem;
										},
									);

									combinedItem[subFieldName] = nestedCombinedArray;
								}
							}
						} else {
							const subPath = _.get(subFieldSchema, "path");
							if (subPath) {
								const propertyName = _.last(subPath as string[]);
								if (propertyName && typeof propertyName === "string") {
									combinedItem[subFieldName] = _.get(item, propertyName, null);
								}
							} else {
								// Handle nested objects that are not arrays
								const nestedObject: Record<string, unknown> = {};
								for (const [
									nestedFieldName,
									nestedFieldSchema,
								] of Object.entries(
									subFieldSchema as Record<string, unknown>,
								)) {
									const nestedPath = _.get(nestedFieldSchema, "path");
									if (nestedPath) {
										const nestedPropertyName = _.last(nestedPath as string[]);
										if (
											nestedPropertyName &&
											typeof nestedPropertyName === "string"
										) {
											nestedObject[nestedFieldName] = _.get(
												item,
												nestedPropertyName,
												null,
											);
										}
									}
								}
								if (!_.isEmpty(nestedObject)) {
									combinedItem[subFieldName] = nestedObject;
								}
							}
						}
					}

					return combinedItem;
				});

				results[fieldName] = combinedArray;
			}
		}
	}
}

/**
 * Transforms [fieldName, resource] pairs to extract desired data using schema descriptions
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
export function extractDataFromResources(
	// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
	resourceEntries: [string, any][],
	// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
	schemaDescriptions: Record<string, any>,
	// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
): Record<string, any> {
	const results: Record<string, unknown> = {};
	const flattenedDescriptions = flattenFieldDescriptions(
		schemaDescriptions as Record<string, unknown>,
	);

	const { arrayGroups, regularFields } = categorizeResourceEntries(
		resourceEntries,
		flattenedDescriptions,
	);

	processRegularFields(regularFields, results);
	processArrayGroups(arrayGroups, results);
	processArrayFields(resourceEntries, schemaDescriptions, results);

	return results;
}

/**
 * Reconstructs array results from indexed field results
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
export function reconstructArrayResults(
	results: Record<string, any>,
): Record<string, any> {
	const reconstructed = { ...results };
	// biome-ignore lint/suspicious/noExplicitAny: Generic resource processing
	const arrayGroups: Record<string, any[]> = {};
	const fieldsToRemove: string[] = [];

	// Find indexed fields and group them
	for (const [key, value] of Object.entries(results)) {
		const match = key.match(/^(.+)_(\d+)$/);
		if (match) {
			const [, baseKey, indexStr] = match;
			if (!baseKey || !indexStr) continue;
			const index = parseInt(indexStr, 10);

			if (!arrayGroups[baseKey]) {
				arrayGroups[baseKey] = [];
			}

			arrayGroups[baseKey][index] = value;
			fieldsToRemove.push(key);
		}
	}

	// Remove indexed fields
	for (const key of fieldsToRemove) {
		delete reconstructed[key];
	}

	// Add reconstructed arrays
	for (const [baseKey, array] of Object.entries(arrayGroups)) {
		// Filter out undefined elements and ensure proper order
		const cleanArray = array.filter((item) => item !== undefined);
		reconstructed[baseKey] = cleanArray;
	}

	return reconstructed;
}
