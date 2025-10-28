import { z } from "zod";

// Default value schema
export const DefaultValueSchema = z.object({
	type: z.string(),
	value: z.string(),
});

// Defaults schema
export const DefaultsSchema = z.record(z.string(), DefaultValueSchema);

// Instance spec schema
export const InstanceSpecSchema = z.object({
	defaults: DefaultsSchema,
	templateType: z.string(),
	title: z.string(),
});

// Main instance resource schema
export const InstanceResourceSchema = z.object({
	apiVersion: z
		.literal("app.sealos.io/v1")
		.optional()
		.default("app.sealos.io/v1"),
	kind: z.literal("Instance").optional().default("Instance"),
	metadata: z.object({
		annotations: z.record(z.string(), z.string()).optional(),
		creationTimestamp: z.string(),
		generation: z.number(),
		labels: z.record(z.string(), z.string()),
		name: z.string(),
		namespace: z.string(),
		resourceVersion: z.string(),
		uid: z.string(),
	}),
	spec: InstanceSpecSchema,
});

// Type exports
export type DefaultValue = z.infer<typeof DefaultValueSchema>;
export type Defaults = z.infer<typeof DefaultsSchema>;
export type InstanceSpec = z.infer<typeof InstanceSpecSchema>;
export type InstanceResource = z.infer<typeof InstanceResourceSchema>;
