import { z } from "zod";

// Builtin resource types
export const BuiltinResourceTypeEnum = z.enum([
	"deployment",
	"service",
	"ingress",
	"statefulset",
	"daemonset",
	"configmap",
	"secret",
	"pod",
	"pvc",
	"hpa",
	"role",
	"rolebinding",
	"serviceaccount",
	"job",
	"cronjob",
	"resourcequota",
	"event",
]);

// Custom resource types
export const CustomResourceTypeEnum = z.enum([
	"issuer",
	"certificate",
	"backup",
	"devbox",
	"cluster",
	"instance",
	"objectstoragebucket",
	"app",
]);

// Builtin Resource Config Schema
export const BuiltinResourceConfigSchema = z.object({
	type: z.literal("builtin"),
	resourceType: BuiltinResourceTypeEnum,
	apiVersion: z.string(),
	kind: z.string(),
	listMethod: z.string(),
	getMethod: z.string(),
	createMethod: z.string(),
	deleteMethod: z.string(),
	patchMethod: z.string(),
	replaceMethod: z.string(),
	deleteCollectionMethod: z.string().optional(),
	apiClient: z.string(),
});

// Custom Resource Config Schema
export const CustomResourceConfigSchema = z.object({
	type: z.literal("custom"),
	resourceType: CustomResourceTypeEnum,
	group: z.string(),
	version: z.string(),
	plural: z.string(),
});

// Builtin Resource Target Schema
export const BuiltinResourceTargetSchema = z.object({
	type: z.literal("builtin"),
	resourceType: BuiltinResourceTypeEnum,
	name: z.string(),
});

// Custom Resource Target Schema
export const CustomResourceTargetSchema = z.object({
	type: z.literal("custom"),
	resourceType: CustomResourceTypeEnum,
	name: z.string(),
});

// Builtin Resource Type Target Schema
export const BuiltinResourceTypeTargetSchema = z
	.object({
		type: z.literal("builtin"),
		resourceType: z.string(),
		name: z.string().optional(),
		label: z.string().optional(),
	})
	.refine(
		(data) => {
			// If label is present, name must also be provided
			if (data.label && data.label !== "") {
				return data.name !== undefined && data.name !== "";
			}
			return true;
		},
		{
			message: "If label is provided, name must also be provided",
			path: ["name"],
		},
	);

// Custom Resource Type Target Schema
export const CustomResourceTypeTargetSchema = z
	.object({
		type: z.literal("custom"),
		resourceType: z.string(),
		name: z.string().optional(),
		label: z.string().optional(),
	})
	.refine(
		(data) => {
			// If label is present, name must also be provided
			if (data.label && data.label !== "") {
				return data.name !== undefined && data.name !== "";
			}
			return true;
		},
		{
			message: "If label is provided, name must also be provided",
			path: ["name"],
		},
	);

// Union schemas for convenience
export const ResourceConfigSchema = z.union([
	BuiltinResourceConfigSchema,
	CustomResourceConfigSchema,
]);

export const ResourceTargetSchema = z.union([
	BuiltinResourceTargetSchema,
	CustomResourceTargetSchema,
]);

export const ResourceTypeTargetSchema = z.union([
	BuiltinResourceTypeTargetSchema,
	CustomResourceTypeTargetSchema,
]);

// Derived types from schemas
export type BuiltinResourceType = z.infer<typeof BuiltinResourceTypeEnum>;
export type CustomResourceType = z.infer<typeof CustomResourceTypeEnum>;

export type BuiltinResourceConfig = z.infer<typeof BuiltinResourceConfigSchema>;
export type CustomResourceConfig = z.infer<typeof CustomResourceConfigSchema>;
export type ResourceConfig = z.infer<typeof ResourceConfigSchema>;

export type BuiltinResourceTarget = z.infer<typeof BuiltinResourceTargetSchema>;
export type CustomResourceTarget = z.infer<typeof CustomResourceTargetSchema>;
export type ResourceTarget = z.infer<typeof ResourceTargetSchema>;

export type BuiltinResourceTypeTarget = z.infer<typeof BuiltinResourceTypeTargetSchema>;
export type CustomResourceTypeTarget = z.infer<typeof CustomResourceTypeTargetSchema>;
export type ResourceTypeTarget = z.infer<typeof ResourceTypeTargetSchema>;
