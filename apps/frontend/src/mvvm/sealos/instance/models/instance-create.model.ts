import { z } from "zod";
import { NameSchema } from "@/mvvm/k8s/models/k8s-resource.model";

// Instance create schema - only requires name
export const instanceCreateSchema = z.object({
	name: NameSchema,
});

// Export types
export type InstanceCreateData = z.infer<typeof instanceCreateSchema>;
