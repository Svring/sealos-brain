import { z } from "zod";

// Resource requirements schema
export const ResourceRequirementsSchema = z.object({
	requests: z.record(z.string(), z.string()),
});

// PVC spec schema
export const PVCSpecSchema = z.object({
	accessModes: z.array(z.string()),
	resources: ResourceRequirementsSchema,
	storageClassName: z.string().optional(),
	volumeMode: z.enum(["Filesystem", "Block"]).optional(),
	volumeName: z.string().optional(),
});

// PVC status schema
export const PVCStatusSchema = z.object({
	accessModes: z.array(z.string()).optional(),
	capacity: z.record(z.string(), z.string()).optional(),
	phase: z.string().optional(),
});

// Main PVC resource schema
export const PVCResourceSchema = z.object({
	apiVersion: z.literal("v1").optional().default("v1"),
	kind: z
		.literal("PersistentVolumeClaim")
		.optional()
		.default("PersistentVolumeClaim"),
	metadata: z.object({
		annotations: z.record(z.string(), z.string()).optional(),
		creationTimestamp: z.string().optional(),
		finalizers: z.array(z.string()).optional(),
		labels: z.record(z.string(), z.string()).optional(),
		name: z.string(),
		namespace: z.string().optional(),
		resourceVersion: z.string().optional(),
		uid: z.string().optional(),
	}),
	spec: PVCSpecSchema,
	status: PVCStatusSchema.optional(),
});

// Type exports
export type ResourceRequirements = z.infer<typeof ResourceRequirementsSchema>;
export type PVCSpec = z.infer<typeof PVCSpecSchema>;
export type PVCStatus = z.infer<typeof PVCStatusSchema>;
export type PVCResource = z.infer<typeof PVCResourceSchema>;
