import { z } from "zod";

// Base Kubernetes object schema with mandatory fields
export const K8sObjectSchema = z
	.object({
		name: z.string(),
		resourceType: z.string(),
	})
	.loose(); // Allow additional fields without validation

// Type export
export type K8sObject = z.infer<typeof K8sObjectSchema>;
