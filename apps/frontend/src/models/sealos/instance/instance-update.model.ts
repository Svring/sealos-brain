import { z } from "zod";
import { NameSchema } from "@/mvvm/k8s/models/k8s-resource.model";

// Instance update schema - contains name and displayName
export const instanceUpdateSchema = z.object({
	name: NameSchema,
	displayName: NameSchema,
});

// Export types
export type InstanceUpdateData = z.infer<typeof instanceUpdateSchema>;
