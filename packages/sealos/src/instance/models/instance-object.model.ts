import { z } from "zod";

export const InstanceObjectSchema = z.object({
	name: z.string(),
	uid: z.string(),
	resourceType: z.string().default("instance"),
	displayName: z.string(),
	createdAt: z.string(),
});

export type InstanceObject = z.infer<typeof InstanceObjectSchema>;
