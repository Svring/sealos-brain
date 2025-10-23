import { z } from "zod";

// Context schema definition
export const K8sContextSchema = z.object({
	kubeconfig: z.string(),
});

// Derived type from schema
export type K8sContext = z.infer<typeof K8sContextSchema>;
