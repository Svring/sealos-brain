import { z } from "zod";

// Schema definitions
export const K8sClientsSchema = z.object({
	customApi: z.any(), // CustomObjectsApi
	appsApi: z.any(), // AppsV1Api
	autoscalingApi: z.any(), // AutoscalingV2Api
	batchApi: z.any(), // BatchV1Api
	coreApi: z.any(), // CoreV1Api
	networkingApi: z.any(), // NetworkingV1Api
	rbacApi: z.any(), // RbacAuthorizationV1Api
});

// Derived types from schemas
export type K8sApiClients = z.infer<typeof K8sClientsSchema>;
