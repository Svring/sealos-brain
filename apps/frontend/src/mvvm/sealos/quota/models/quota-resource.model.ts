import { z } from "zod";

// Resource quota limits schema
export const QuotaLimitsSchema = z
	.object({
		"limits.cpu": z.string().optional(),
		"limits.ephemeral-storage": z.string().optional(),
		"limits.memory": z.string().optional(),
		"limits.nvidia.com/gpu": z.string().optional(),
		"objectstorage/bucket": z.string().optional(),
		"objectstorage/size": z.string().optional(),
		"requests.nvidia.com/gpu": z.string().optional(),
		"requests.storage": z.string().optional(),
		"services.nodeports": z.string().optional(),
		// Allow for additional dynamic resource limits
	})
	.catchall(z.string());

// Resource quota used schema
export const QuotaUsedSchema = z
	.object({
		"limits.cpu": z.string().optional(),
		"limits.ephemeral-storage": z.string().optional(),
		"limits.memory": z.string().optional(),
		"requests.nvidia.com/gpu": z.string().optional(),
		"requests.storage": z.string().optional(),
		"services.nodeports": z.string().optional(),
		// Allow for additional dynamic resource usage
	})
	.catchall(z.string());

// Resource quota spec schema
export const QuotaSpecSchema = z.object({
	hard: QuotaLimitsSchema,
	scopes: z.array(z.string()).optional(),
	scopeSelector: z
		.object({
			matchExpressions: z
				.array(
					z.object({
						key: z.string(),
						operator: z.string(),
						values: z.array(z.string()).optional(),
					}),
				)
				.optional(),
		})
		.optional(),
});

// Resource quota status schema
export const QuotaStatusSchema = z.object({
	hard: QuotaLimitsSchema,
	used: QuotaUsedSchema,
});

// Main resource quota schema
export const QuotaResourceSchema = z.object({
	apiVersion: z.literal("v1").optional().default("v1"),
	kind: z.literal("ResourceQuota").optional().default("ResourceQuota"),
	metadata: z.object({
		annotations: z.record(z.string(), z.string()).optional(),
		creationTimestamp: z.string(),
		finalizers: z.array(z.string()).optional(),
		generation: z.number().optional(),
		labels: z.record(z.string(), z.string()).optional(),
		name: z.string(),
		namespace: z.string(),
		resourceVersion: z.string(),
		uid: z.string(),
	}),
	spec: QuotaSpecSchema,
	status: QuotaStatusSchema,
});

// Type exports
export type QuotaLimits = z.infer<typeof QuotaLimitsSchema>;
export type QuotaUsed = z.infer<typeof QuotaUsedSchema>;
export type QuotaSpec = z.infer<typeof QuotaSpecSchema>;
export type QuotaStatus = z.infer<typeof QuotaStatusSchema>;
export type QuotaResource = z.infer<typeof QuotaResourceSchema>;
