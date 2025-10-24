import { z } from "zod";

// Resource value schema for used/limit pairs
export const ResourceValueSchema = z.object({
	used: z.number(),
	limit: z.number(),
});

// Quota object schema matching QuotaProvider structure
export const QuotaObjectSchema = z.object({
	cpu: ResourceValueSchema.nullable(),
	memory: ResourceValueSchema.nullable(),
	storage: ResourceValueSchema.nullable(),
	ports: ResourceValueSchema.nullable(),
});

// Type exports
export type ResourceValue = z.infer<typeof ResourceValueSchema>;
export type QuotaObject = z.infer<typeof QuotaObjectSchema>;
