import { z } from "zod";

/**
 * Resource reliance/dependency schema
 */
export const ResourceRelianceSchema = z.object({
	name: z.string(),
	kind: z.string(),
});

/**
 * Resource reliances grouped by kind and resource name
 */
export const ResourceReliancesSchema = z.record(
	z.string(), // kind
	z.record(
		z.string(), // resource name
		z.array(ResourceRelianceSchema), // array of dependencies
	),
);

// Type exports
export type ResourceReliance = z.infer<typeof ResourceRelianceSchema>;
export type ResourceReliances = z.infer<typeof ResourceReliancesSchema>;
