import { NameSchema } from "@sealos-brain/k8s/shared/models";
import { z } from "zod";

// AI Proxy create schema
export const aiProxyCreateSchema = z.object({
	name: NameSchema,
});

// Export types
export type AiProxyCreateData = z.infer<typeof aiProxyCreateSchema>;
