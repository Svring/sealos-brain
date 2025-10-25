import { z } from "zod";

// Label selector schema
export const LabelSelectorSchema = z.object({
	matchLabels: z.record(z.string(), z.string()),
});

// Rolling update schema
export const RollingUpdateSchema = z.object({
	maxSurge: z.union([z.number(), z.string()]),
	maxUnavailable: z.union([z.number(), z.string()]),
});

// Deployment strategy schema
export const DeploymentStrategySchema = z.object({
	rollingUpdate: RollingUpdateSchema.optional(),
	type: z.enum(["RollingUpdate", "Recreate"]),
});

// Environment variable schema
export const EnvVarSchema = z.object({
	name: z.string(),
	value: z.string().optional(),
	valueFrom: z
		.object({
			secretKeyRef: z.object({
				name: z.string(),
				key: z.string(),
			}),
		})
		.optional(),
});

// Container port schema
export const ContainerPortSchema = z.object({
	containerPort: z.number(),
	name: z.string().optional(),
	protocol: z.enum(["TCP", "UDP", "SCTP"]).default("TCP"),
	hostIP: z.string().optional(),
	hostPort: z.number().optional(),
});

// Resource requirements schema
export const ResourceRequirementsSchema = z.object({
	limits: z.record(z.string(), z.string()).optional(),
	requests: z.record(z.string(), z.string()).optional(),
});

// Volume mount schema
export const VolumeMountSchema = z.object({
	name: z.string(),
	mountPath: z.string(),
	readOnly: z.boolean().optional(),
	subPath: z.string().optional(),
});

// Container schema
export const ContainerSchema = z.object({
	name: z.string(),
	image: z.string(),
	imagePullPolicy: z.enum(["Always", "Never", "IfNotPresent"]).optional(),
	ports: z.array(ContainerPortSchema).optional(),
	env: z.array(EnvVarSchema).optional(),
	resources: ResourceRequirementsSchema.optional(),
	volumeMounts: z.array(VolumeMountSchema).optional(),
	terminationMessagePath: z.string().optional(),
	terminationMessagePolicy: z
		.enum(["File", "FallbackToLogsOnError"])
		.optional(),
});

// Pod security context schema
export const PodSecurityContextSchema = z.object({});

// Pod template spec schema
export const PodTemplateSpecSchema = z.object({
	metadata: z
		.object({
			labels: z.record(z.string(), z.string()).optional(),
			annotations: z.record(z.string(), z.string()).optional(),
		})
		.optional(),
	spec: z.object({
		automountServiceAccountToken: z.boolean().optional(),
		containers: z.array(ContainerSchema),
		dnsPolicy: z
			.enum(["ClusterFirst", "ClusterFirstWithHostNet", "Default", "None"])
			.optional(),
		restartPolicy: z.enum(["Always", "OnFailure", "Never"]).optional(),
		schedulerName: z.string().optional(),
		securityContext: PodSecurityContextSchema.optional(),
		terminationGracePeriodSeconds: z.number().optional(),
		volumes: z.array(z.any()).optional(),
	}),
});

// Deployment condition schema
export const DeploymentConditionSchema = z.object({
	lastTransitionTime: z.string(),
	lastUpdateTime: z.string().optional(),
	message: z.string(),
	reason: z.string(),
	status: z.enum(["True", "False", "Unknown"]),
	type: z.string(),
});

// Deployment status schema
export const DeploymentStatusSchema = z.object({
	availableReplicas: z.number().optional(),
	conditions: z.array(DeploymentConditionSchema).optional(),
	observedGeneration: z.number().optional(),
	readyReplicas: z.number().optional(),
	replicas: z.number().optional(),
	updatedReplicas: z.number().optional(),
});

// Deployment spec schema
export const DeploymentSpecSchema = z.object({
	progressDeadlineSeconds: z.number().optional(),
	replicas: z.number().optional(),
	revisionHistoryLimit: z.number().optional(),
	selector: LabelSelectorSchema,
	strategy: DeploymentStrategySchema.optional(),
	template: PodTemplateSpecSchema,
});

// Main deployment resource schema
export const DeploymentResourceSchema = z.object({
	apiVersion: z.literal("apps/v1").optional().default("apps/v1"),
	kind: z.literal("Deployment"),
	metadata: z.object({
		name: z.string(),
		namespace: z.string().optional(),
		uid: z.string(),
		resourceVersion: z.string().optional(),
		generation: z.number().optional(),
		creationTimestamp: z.string().optional(),
		labels: z.record(z.string(), z.string()).optional(),
		annotations: z.record(z.string(), z.string()).optional(),
	}),
	spec: DeploymentSpecSchema,
	status: DeploymentStatusSchema.optional(),
});

// Type exports
export type LabelSelector = z.infer<typeof LabelSelectorSchema>;
export type RollingUpdate = z.infer<typeof RollingUpdateSchema>;
export type DeploymentStrategy = z.infer<typeof DeploymentStrategySchema>;
export type EnvVar = z.infer<typeof EnvVarSchema>;
export type ContainerPort = z.infer<typeof ContainerPortSchema>;
export type ResourceRequirements = z.infer<typeof ResourceRequirementsSchema>;
export type VolumeMount = z.infer<typeof VolumeMountSchema>;
export type Container = z.infer<typeof ContainerSchema>;
export type PodSecurityContext = z.infer<typeof PodSecurityContextSchema>;
export type PodTemplateSpec = z.infer<typeof PodTemplateSpecSchema>;
export type DeploymentCondition = z.infer<typeof DeploymentConditionSchema>;
export type DeploymentStatus = z.infer<typeof DeploymentStatusSchema>;
export type DeploymentSpec = z.infer<typeof DeploymentSpecSchema>;
export type DeploymentResource = z.infer<typeof DeploymentResourceSchema>;
