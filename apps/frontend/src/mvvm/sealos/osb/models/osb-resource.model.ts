import { z } from "zod";

// ObjectStorageBucket metadata schema
export const ObjectStorageBucketMetadataSchema = z.object({
	annotations: z.record(z.string(), z.string()).optional(),
	creationTimestamp: z.string().optional(),
	finalizers: z.array(z.string()).optional(),
	generation: z.number().optional(),
	labels: z.record(z.string(), z.string()).optional(),
	name: z.string(),
	namespace: z.string().optional(),
	resourceVersion: z.string().optional(),
	uid: z.string().optional(),
});

// ObjectStorageBucket spec schema
export const ObjectStorageBucketSpecSchema = z.object({
	policy: z.enum(["private", "public", "public-read", "public-read-write"]).default("private"),
});

// ObjectStorageBucket status schema
export const ObjectStorageBucketStatusSchema = z.object({
	name: z.string().optional(),
});

// Main ObjectStorageBucket resource schema
export const ObjectStorageBucketResourceSchema = z.object({
	apiVersion: z
		.literal("objectstorage.sealos.io/v1")
		.optional()
		.default("objectstorage.sealos.io/v1"),
	kind: z.literal("ObjectStorageBucket").optional().default("ObjectStorageBucket"),
	metadata: ObjectStorageBucketMetadataSchema,
	spec: ObjectStorageBucketSpecSchema,
	status: ObjectStorageBucketStatusSchema.optional(),
});

// Type exports
export type ObjectStorageBucketMetadata = z.infer<
	typeof ObjectStorageBucketMetadataSchema
>;
export type ObjectStorageBucketSpec = z.infer<typeof ObjectStorageBucketSpecSchema>;
export type ObjectStorageBucketStatus = z.infer<typeof ObjectStorageBucketStatusSchema>;
export type ObjectStorageBucketResource = z.infer<
	typeof ObjectStorageBucketResourceSchema
>;
