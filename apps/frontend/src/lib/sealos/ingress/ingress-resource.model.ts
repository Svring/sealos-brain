import { z } from "zod";

/**
 * Kubernetes Ingress Backend Service schema
 */
export const IngressBackendServiceSchema = z.object({
	name: z.string(),
	port: z.object({
		number: z.number().optional(),
		name: z.string().optional(),
	}).optional(),
});

/**
 * Kubernetes Ingress Backend schema
 */
export const IngressBackendSchema = z.object({
	service: IngressBackendServiceSchema.optional(),
	resource: z.object({
		apiGroup: z.string(),
		kind: z.string(),
		name: z.string(),
	}).optional(),
});

/**
 * Kubernetes Ingress Path schema
 */
export const IngressPathSchema = z.object({
	path: z.string().optional(),
	pathType: z.string().optional(),
	backend: IngressBackendSchema.optional(),
});

/**
 * Kubernetes Ingress HTTP schema
 */
export const IngressHttpSchema = z.object({
	paths: z.array(IngressPathSchema).optional(),
});

/**
 * Kubernetes Ingress Rule schema
 */
export const IngressRuleSchema = z.object({
	host: z.string().optional(),
	http: IngressHttpSchema.optional(),
});

/**
 * Kubernetes Ingress TLS schema
 */
export const IngressTLSSchema = z.object({
	hosts: z.array(z.string()).optional(),
	secretName: z.string().optional(),
});

/**
 * Kubernetes Ingress Spec schema
 */
export const IngressSpecSchema = z.object({
	rules: z.array(IngressRuleSchema).optional(),
	tls: z.array(IngressTLSSchema).optional(),
	ingressClassName: z.string().optional(),
});

/**
 * Kubernetes Ingress Status LoadBalancer Ingress schema
 */
export const IngressStatusLoadBalancerIngressSchema = z.object({
	ip: z.string().optional(),
	hostname: z.string().optional(),
	ports: z.array(z.object({
		port: z.number(),
		protocol: z.string(),
		error: z.string().optional(),
	})).optional(),
});

/**
 * Kubernetes Ingress Status LoadBalancer schema
 */
export const IngressStatusLoadBalancerSchema = z.object({
	ingress: z.array(IngressStatusLoadBalancerIngressSchema).optional(),
});

/**
 * Kubernetes Ingress Status schema
 */
export const IngressStatusSchema = z.object({
	loadBalancer: IngressStatusLoadBalancerSchema.optional(),
});

/**
 * Kubernetes Ingress Metadata schema
 */
export const IngressMetadataSchema = z.object({
	creationTimestamp: z.string().optional(),
	labels: z.record(z.string()).optional(),
	name: z.string().optional(),
	namespace: z.string().optional(),
	resourceVersion: z.string().optional(),
	uid: z.string().optional(),
	annotations: z.record(z.string()).optional(),
});

/**
 * Kubernetes Ingress resource schema
 */
export const IngressResourceSchema = z.object({
	apiVersion: z.string(),
	kind: z.literal("Ingress"),
	metadata: IngressMetadataSchema,
	spec: IngressSpecSchema,
	status: IngressStatusSchema.optional(),
});

// Type exports
export type IngressBackendService = z.infer<typeof IngressBackendServiceSchema>;
export type IngressBackend = z.infer<typeof IngressBackendSchema>;
export type IngressPath = z.infer<typeof IngressPathSchema>;
export type IngressHttp = z.infer<typeof IngressHttpSchema>;
export type IngressRule = z.infer<typeof IngressRuleSchema>;
export type IngressTLS = z.infer<typeof IngressTLSSchema>;
export type IngressSpec = z.infer<typeof IngressSpecSchema>;
export type IngressStatusLoadBalancerIngress = z.infer<typeof IngressStatusLoadBalancerIngressSchema>;
export type IngressStatusLoadBalancer = z.infer<typeof IngressStatusLoadBalancerSchema>;
export type IngressStatus = z.infer<typeof IngressStatusSchema>;
export type IngressMetadata = z.infer<typeof IngressMetadataSchema>;
export type IngressResource = z.infer<typeof IngressResourceSchema>;
