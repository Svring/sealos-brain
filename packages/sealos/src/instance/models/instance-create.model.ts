import { z } from "zod";

export const InstanceCreateSchema = z.object({
	name: z.string(),
	displayName: z.string().optional(),
});

export type InstanceCreate = z.infer<typeof InstanceCreateSchema>;
