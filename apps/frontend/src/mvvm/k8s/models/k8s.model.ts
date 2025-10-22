// Re-export all models from the split files
export * from "./k8s-builtin.model";
export * from "./k8s-clients.model";
export * from "./k8s-custom.model";

// Union schemas for convenience
import { z } from "zod";
import { BuiltinResourceTargetSchema, BuiltinResourceTypeTargetSchema } from "./k8s-builtin.model";
import { CustomResourceTargetSchema, CustomResourceTypeTargetSchema } from "./k8s-custom.model";

export const resourceTargetSchema = z.union([
	BuiltinResourceTargetSchema,
	CustomResourceTargetSchema,
]);

export const resourceTypeTargetSchema = z.union([
	BuiltinResourceTypeTargetSchema,
	CustomResourceTypeTargetSchema,
]);

// Derived types from union schemas
export type ResourceTarget = z.infer<typeof resourceTargetSchema>;
export type ResourceTypeTarget = z.infer<typeof resourceTypeTargetSchema>;
