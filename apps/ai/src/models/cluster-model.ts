import { z } from "zod";

// biome-ignore lint/suspicious/noExplicitAny: Schema parsing utility
function parseFieldDescriptions(schema: z.ZodObject<any>): any {
	const jsonSchema = z.toJSONSchema(schema);
	const properties = jsonSchema.properties || {};
	const result: Record<string, unknown> = {};

	for (const [key, propertySchema] of Object.entries(properties)) {
		if (!propertySchema || typeof propertySchema !== "object") continue;

		// Extract metadata fields (resourceType, path, etc.)
		// Filter out JSON schema specific properties
		const jsonSchemaKeys = [
			"type",
			"description",
			"anyOf",
			"oneOf",
			"allOf",
			"enum",
			"default",
			"const",
			"items",
			"properties",
			"required",
			"additionalProperties",
		];
		const metadata = Object.fromEntries(
			Object.entries(propertySchema).filter(
				([propKey]) => !jsonSchemaKeys.includes(propKey),
			),
		);

		let nestedResult = {};
		// Handle nested objects in JSON schema
		if (propertySchema.type === "object" && propertySchema.properties) {
			nestedResult = parseFieldDescriptions(
				z.object(Object.fromEntries(Object.entries(propertySchema.properties))),
			);
		} else if (propertySchema.type === "array" && propertySchema.items) {
			const items = propertySchema.items;
			if (
				items &&
				typeof items === "object" &&
				"type" in items &&
				items.type === "object" &&
				"properties" in items &&
				items.properties
			) {
				nestedResult = {
					_isArray: true,
					...parseFieldDescriptions(
						z.object(Object.fromEntries(Object.entries(items.properties))),
					),
				};
			}
		}

		result[key] = {
			...metadata,
			...(Object.keys(nestedResult).length > 0 ? nestedResult : {}),
		};
	}

	return result;
}

export const ClusterBridgeSchema = z.object({
	name: z.any().meta({
		resourceType: "cluster",
		path: ["metadata.name"],
	}),
	uid: z.any().meta({
		resourceType: "cluster",
		path: ["metadata.uid"],
	}),
	type: z.any().meta({
		resourceType: "cluster",
		path: ["spec.clusterDefinitionRef"],
	}),
	version: z.any().meta({
		resourceType: "cluster",
		path: ["spec.clusterVersionRef"],
	}),
	status: z
		.any()
		.nullable()
		.meta({
			resourceType: "cluster",
			path: ["status.phase"],
		}),
	resource: z.any().meta({
		resourceType: "cluster",
		path: ["spec.componentSpecs"],
	}),
});

console.log(parseFieldDescriptions(ClusterBridgeSchema));
