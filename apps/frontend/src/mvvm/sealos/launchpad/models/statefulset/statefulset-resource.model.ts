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

// StatefulSet update strategy schema
export const StatefulSetUpdateStrategySchema = z.object({
	rollingUpdate: RollingUpdateSchema.optional(),
	type: z.enum(["RollingUpdate", "OnDelete"]),
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

// Persistent volume claim template schema
export const PersistentVolumeClaimTemplateSchema = z.object({
	metadata: z
		.object({
			name: z.string(),
			labels: z.record(z.string(), z.string()).optional(),
			annotations: z.record(z.string(), z.string()).optional(),
		})
		.optional(),
	spec: z.object({
		accessModes: z.array(z.string()),
		resources: z.object({
			requests: z.record(z.string(), z.string()),
		}),
		storageClassName: z.string().optional(),
		volumeMode: z.enum(["Filesystem", "Block"]).optional(),
	}),
});

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

// StatefulSet condition schema
export const StatefulSetConditionSchema = z.object({
	lastTransitionTime: z.string(),
	lastUpdateTime: z.string().optional(),
	message: z.string(),
	reason: z.string(),
	status: z.enum(["True", "False", "Unknown"]),
	type: z.string(),
});

// StatefulSet status schema
export const StatefulSetStatusSchema = z.object({
	availableReplicas: z.number().optional(),
	conditions: z.array(StatefulSetConditionSchema).optional(),
	observedGeneration: z.number().optional(),
	readyReplicas: z.number().optional(),
	replicas: z.number().optional(),
	updatedReplicas: z.number().optional(),
	currentReplicas: z.number().optional(),
	currentRevision: z.string().optional(),
	updateRevision: z.string().optional(),
});

// StatefulSet spec schema
export const StatefulSetSpecSchema = z.object({
	replicas: z.number().optional(),
	selector: LabelSelectorSchema,
	template: PodTemplateSpecSchema,
	updateStrategy: StatefulSetUpdateStrategySchema.optional(),
	volumeClaimTemplates: z.array(PersistentVolumeClaimTemplateSchema).optional(),
	serviceName: z.string().optional(),
	podManagementPolicy: z.enum(["OrderedReady", "Parallel"]).optional(),
});

// Main statefulset resource schema
export const StatefulSetResourceSchema = z.object({
	apiVersion: z.literal("apps/v1").optional().default("apps/v1"),
	kind: z.literal("StatefulSet").optional().default("StatefulSet"),
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
	spec: StatefulSetSpecSchema,
	status: StatefulSetStatusSchema.optional(),
});

// Type exports
export type LabelSelector = z.infer<typeof LabelSelectorSchema>;
export type RollingUpdate = z.infer<typeof RollingUpdateSchema>;
export type StatefulSetUpdateStrategy = z.infer<
	typeof StatefulSetUpdateStrategySchema
>;
export type EnvVar = z.infer<typeof EnvVarSchema>;
export type ContainerPort = z.infer<typeof ContainerPortSchema>;
export type ResourceRequirements = z.infer<typeof ResourceRequirementsSchema>;
export type VolumeMount = z.infer<typeof VolumeMountSchema>;
export type Container = z.infer<typeof ContainerSchema>;
export type PodSecurityContext = z.infer<typeof PodSecurityContextSchema>;
export type PersistentVolumeClaimTemplate = z.infer<
	typeof PersistentVolumeClaimTemplateSchema
>;
export type PodTemplateSpec = z.infer<typeof PodTemplateSpecSchema>;
export type StatefulSetCondition = z.infer<typeof StatefulSetConditionSchema>;
export type StatefulSetStatus = z.infer<typeof StatefulSetStatusSchema>;
export type StatefulSetSpec = z.infer<typeof StatefulSetSpecSchema>;
export type StatefulSetResource = z.infer<typeof StatefulSetResourceSchema>;
