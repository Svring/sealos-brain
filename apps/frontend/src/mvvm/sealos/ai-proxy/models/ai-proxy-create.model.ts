import { z } from "zod";
import { NameSchema } from "@/mvvm/k8s/models/k8s-resource.model";

// AI Proxy create schema
export const aiProxyCreateSchema = z.object({
	name: NameSchema,
});

// Export types
export type AiProxyCreateData = z.infer<typeof aiProxyCreateSchema>;
