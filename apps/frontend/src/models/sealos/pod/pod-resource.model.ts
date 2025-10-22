import { z } from "zod";

// Owner reference schema
export const OwnerReferenceSchema = z.object({
	apiVersion: z.string(),
	blockOwnerDeletion: z.boolean().optional(),
	controller: z.boolean().optional(),
	kind: z.string(),
	name: z.string(),
	uid: z.string(),
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

// Container schema
export const ContainerSchema = z.object({
	name: z.string(),
	image: z.string(),
	imagePullPolicy: z.enum(["Always", "Never", "IfNotPresent"]).optional(),
	ports: z.array(ContainerPortSchema).optional(),
	env: z.array(EnvVarSchema).optional(),
	resources: ResourceRequirementsSchema.optional(),
	terminationMessagePath: z.string().optional(),
	terminationMessagePolicy: z.enum(["File", "FallbackToLogsOnError"]).optional(),
});

// Pod security context schema
export const PodSecurityContextSchema = z.object({});

// Toleration schema
export const TolerationSchema = z.object({
	key: z.string().optional(),
	operator: z.string().optional(),
	value: z.string().optional(),
	effect: z.string().optional(),
	tolerationSeconds: z.number().optional(),
});

// Pod spec schema
export const PodSpecSchema = z.object({
	automountServiceAccountToken: z.boolean().optional(),
	containers: z.array(ContainerSchema),
	dnsPolicy: z.enum(["ClusterFirst", "ClusterFirstWithHostNet", "Default", "None"]).optional(),
	enableServiceLinks: z.boolean().optional(),
	nodeName: z.string().optional(),
	preemptionPolicy: z.string().optional(),
	priority: z.number().optional(),
	restartPolicy: z.enum(["Always", "OnFailure", "Never"]).optional(),
	schedulerName: z.string().optional(),
	securityContext: PodSecurityContextSchema.optional(),
	serviceAccount: z.string().optional(),
	serviceAccountName: z.string().optional(),
	terminationGracePeriodSeconds: z.number().optional(),
	tolerations: z.array(TolerationSchema).optional(),
});

// Pod condition schema
export const PodConditionSchema = z.object({
	lastProbeTime: z.string().nullable().optional(),
	lastTransitionTime: z.string(),
	status: z.enum(["True", "False", "Unknown"]),
	type: z.string(),
});

// Container state schema
export const ContainerStateSchema = z.object({
	running: z.object({
		startedAt: z.string(),
	}).optional(),
	waiting: z.object({
		reason: z.string().optional(),
		message: z.string().optional(),
	}).optional(),
	terminated: z.object({
		exitCode: z.number().optional(),
		signal: z.number().optional(),
		reason: z.string().optional(),
		message: z.string().optional(),
		startedAt: z.string().optional(),
		finishedAt: z.string().optional(),
		containerID: z.string().optional(),
	}).optional(),
});

// Container status schema
export const ContainerStatusSchema = z.object({
	containerID: z.string().optional(),
	image: z.string(),
	imageID: z.string(),
	lastState: ContainerStateSchema.optional(),
	name: z.string(),
	ready: z.boolean(),
	restartCount: z.number(),
	started: z.boolean().optional(),
	state: ContainerStateSchema.optional(),
});

// Pod IP schema
export const PodIPSchema = z.object({
	ip: z.string(),
});

// Pod status schema
export const PodStatusSchema = z.object({
	conditions: z.array(PodConditionSchema).optional(),
	containerStatuses: z.array(ContainerStatusSchema).optional(),
	hostIP: z.string().optional(),
	phase: z.string().optional(),
	podIP: z.string().optional(),
	podIPs: z.array(PodIPSchema).optional(),
	qosClass: z.string().optional(),
	startTime: z.string().optional(),
});

// Main pod resource schema
export const PodResourceSchema = z.object({
	apiVersion: z.literal("v1").optional().default("v1"),
	kind: z.literal("Pod").optional().default("Pod"),
	metadata: z.object({
		annotations: z.record(z.string(), z.string()).optional(),
		creationTimestamp: z.string().optional(),
		generateName: z.string().optional(),
		labels: z.record(z.string(), z.string()).optional(),
		name: z.string(),
		namespace: z.string().optional(),
		ownerReferences: z.array(OwnerReferenceSchema).optional(),
		resourceVersion: z.string().optional(),
		uid: z.string().optional(),
	}),
	spec: PodSpecSchema,
	status: PodStatusSchema.optional(),
});

// Type exports
export type OwnerReference = z.infer<typeof OwnerReferenceSchema>;
export type EnvVar = z.infer<typeof EnvVarSchema>;
export type ContainerPort = z.infer<typeof ContainerPortSchema>;
export type ResourceRequirements = z.infer<typeof ResourceRequirementsSchema>;
export type Container = z.infer<typeof ContainerSchema>;
export type PodSecurityContext = z.infer<typeof PodSecurityContextSchema>;
export type Toleration = z.infer<typeof TolerationSchema>;
export type PodSpec = z.infer<typeof PodSpecSchema>;
export type PodCondition = z.infer<typeof PodConditionSchema>;
export type ContainerState = z.infer<typeof ContainerStateSchema>;
export type ContainerStatus = z.infer<typeof ContainerStatusSchema>;
export type PodIP = z.infer<typeof PodIPSchema>;
export type PodStatus = z.infer<typeof PodStatusSchema>;
export type PodResource = z.infer<typeof PodResourceSchema>;
