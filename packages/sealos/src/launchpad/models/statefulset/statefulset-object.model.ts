import { EnvSchema } from "@sealos-brain/k8s/shared/models";
import { z } from "zod";

export const PortSchema = z.object({
	number: z.number(),
	portName: z.string().optional(),
	nodePort: z.number().optional(),
	protocol: z.string(),
	serviceName: z.string().optional(),
	privateAddress: z.string().optional(),
	privateHost: z.string().optional(),
	publicAddress: z.string().optional(),
	networkName: z.string().optional(),
	publicHost: z.string().optional(),
});

export const StatefulsetQuotaSchema = z.object({
	replicas: z.number(),
	cpu: z.number(),
	memory: z.number(),
	storage: z.number(),
});

export const PodSchema = z.object({
	name: z.string(),
	status: z.string(),
	containers: z.any(),
});

export const ThresholdSchema = z.object({
	resource: z.string(),
	usage: z.number(),
});

export const StrategySchema = z.object({
	type: z.enum(["fixed", "flexible"]),
	minReplicas: z.number().optional(),
	maxReplicas: z.number().optional(),
	threshold: ThresholdSchema.optional(),
});

export const OperationalStatusSchema = z.object({
	createdAt: z.string(),
});

export const ImageRegistrySchema = z.object({
	serverAddress: z.string(),
	username: z.string(),
	password: z.string(),
});

export const ImageSchema = z.object({
	imageName: z.string(),
	imageRegistry: ImageRegistrySchema.nullable().optional(),
});

export const ConfigMapSchema = z.object({
	path: z.string(),
	content: z.string(),
});

export const LocalStorageSchema = z.object({
	path: z.string(),
	value: z.string(),
});

// StatefulSet object schema
export const StatefulsetObjectSchema = z.object({
	name: z.string(),
	uid: z.string(),
	resourceType: z.literal("statefulset"),
	image: ImageSchema,
	quota: StatefulsetQuotaSchema,
	status: z.string().nullable(),
	launchCommand: z
		.object({
			command: z.array(z.string()),
			args: z.array(z.string()),
		})
		.optional(),
	env: z.array(EnvSchema).optional(),
	ports: z.array(PortSchema).optional(),
	configMap: z.array(ConfigMapSchema).optional(),
	localStorage: z.array(LocalStorageSchema).optional(),
	pods: z.array(PodSchema).optional(),
	operationalStatus: OperationalStatusSchema.optional(),
	strategy: StrategySchema.optional(),
});

// Type exports
export type Port = z.infer<typeof PortSchema>;
export type StatefulsetQuota = z.infer<typeof StatefulsetQuotaSchema>;
export type Pod = z.infer<typeof PodSchema>;
export type Threshold = z.infer<typeof ThresholdSchema>;
export type Strategy = z.infer<typeof StrategySchema>;
export type OperationalStatus = z.infer<typeof OperationalStatusSchema>;
export type ImageRegistry = z.infer<typeof ImageRegistrySchema>;
export type Image = z.infer<typeof ImageSchema>;
export type ConfigMap = z.infer<typeof ConfigMapSchema>;
export type LocalStorage = z.infer<typeof LocalStorageSchema>;
export type StatefulsetObject = z.infer<typeof StatefulsetObjectSchema>;
