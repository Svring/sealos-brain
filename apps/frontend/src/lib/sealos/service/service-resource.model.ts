import { z } from "zod";

/**
 * Kubernetes Service Port schema
 */
export const ServicePortSchema = z.object({
	name: z.string().optional(),
	port: z.number(),
	protocol: z.string().optional(),
	targetPort: z.union([z.number(), z.string()]).optional(),
	nodePort: z.number().optional(),
});

/**
 * Kubernetes Service Selector schema
 */
export const ServiceSelectorSchema = z.record(z.string());

/**
 * Kubernetes Service Spec schema
 */
export const ServiceSpecSchema = z.object({
	clusterIP: z.string().optional(),
	clusterIPs: z.array(z.string()).optional(),
	internalTrafficPolicy: z.string().optional(),
	ipFamilies: z.array(z.string()).optional(),
	ipFamilyPolicy: z.string().optional(),
	ports: z.array(ServicePortSchema).optional(),
	selector: ServiceSelectorSchema.optional(),
	sessionAffinity: z.string().optional(),
	type: z.string().optional(),
});

/**
 * Kubernetes Service Status schema
 */
export const ServiceStatusSchema = z.object({
	loadBalancer: z.record(z.unknown()).optional(),
});

/**
 * Kubernetes Service Metadata schema
 */
export const ServiceMetadataSchema = z.object({
	creationTimestamp: z.string().optional(),
	labels: z.record(z.string()).optional(),
	name: z.string().optional(),
	namespace: z.string().optional(),
	resourceVersion: z.string().optional(),
	uid: z.string().optional(),
});

/**
 * Kubernetes Service resource schema
 */
export const ServiceResourceSchema = z.object({
	apiVersion: z.string(),
	kind: z.literal("Service"),
	metadata: ServiceMetadataSchema,
	spec: ServiceSpecSchema,
	status: ServiceStatusSchema.optional(),
});

// Type exports
export type ServicePort = z.infer<typeof ServicePortSchema>;
export type ServiceSelector = z.infer<typeof ServiceSelectorSchema>;
export type ServiceSpec = z.infer<typeof ServiceSpecSchema>;
export type ServiceStatus = z.infer<typeof ServiceStatusSchema>;
export type ServiceMetadata = z.infer<typeof ServiceMetadataSchema>;
export type ServiceResource = z.infer<typeof ServiceResourceSchema>;
