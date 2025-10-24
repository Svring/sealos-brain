import { z } from "zod";

export const InstanceUpdateSchema = z.object({
	name: z.string(),
	displayName: z.string(),
});

export type InstanceUpdate = z.infer<typeof InstanceUpdateSchema>;
