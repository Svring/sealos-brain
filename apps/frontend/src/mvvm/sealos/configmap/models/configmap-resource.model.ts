import { z } from "zod";

// Owner reference schema
export const OwnerReferenceSchema = z.object({
	apiVersion: z.string(),
	blockOwnerDeletion: z.boolean().optional(),
	controller: z.boolean().optional(),
	kind: z.string(),
	name: z.string(),
	uid: z.string(),
});

// Main configmap resource schema
export const ConfigMapResourceSchema = z.object({
	apiVersion: z.literal("v1").optional().default("v1"),
	kind: z.literal("ConfigMap").optional().default("ConfigMap"),
	metadata: z.object({
		creationTimestamp: z.string().optional(),
		finalizers: z.array(z.string()).optional(),
		labels: z.record(z.string(), z.string()).optional(),
		name: z.string(),
		namespace: z.string().optional(),
		ownerReferences: z.array(OwnerReferenceSchema).optional(),
		resourceVersion: z.string().optional(),
		uid: z.string().optional(),
	}),
	data: z.record(z.string(), z.string()).optional(),
});

// Type exports
export type OwnerReference = z.infer<typeof OwnerReferenceSchema>;
export type ConfigMapResource = z.infer<typeof ConfigMapResourceSchema>;
