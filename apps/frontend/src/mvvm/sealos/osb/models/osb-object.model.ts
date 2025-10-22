import { z } from "zod";

// Osb Access Configuration Schema
export const OsbAccessSchema = z.object({
	accessKey: z.string(),
	bucket: z.string(),
	external: z.string(),
	internal: z.string(),
	secretKey: z.string(),
});

// Osb Policy Enum
export const OsbPolicySchema = z.enum([
	"private",
	"publicRead",
	"publicReadwrite",
]);

// Main Osb Object Schema
export const OsbObjectSchema = z.object({
	name: z.string(),
	uid: z.string(),
	displayName: z.string(),
	kind: z.string(),
	resourceType: z.string().default("objectstoragebucket"),
	policy: OsbPolicySchema,
	access: OsbAccessSchema,
});

// Type exports
export type OsbAccess = z.infer<typeof OsbAccessSchema>;
export type OsbPolicy = z.infer<typeof OsbPolicySchema>;
export type OsbObject = z.infer<typeof OsbObjectSchema>;
