import { z } from "zod";

// Node selector requirement schema
export const NodeSelectorRequirementSchema = z.object({
	key: z.string(),
	operator: z.enum(["In", "NotIn", "Exists", "DoesNotExist", "Gt", "Lt"]),
	values: z.array(z.string()).optional(),
});

// Node selector term schema
export const NodeSelectorTermSchema = z.object({
	matchExpressions: z.array(NodeSelectorRequirementSchema).optional(),
	matchFields: z.array(NodeSelectorRequirementSchema).optional(),
});

// Node affinity schema
export const NodeAffinitySchema = z.object({
	requiredDuringSchedulingIgnoredDuringExecution: z
		.object({
			nodeSelectorTerms: z.array(NodeSelectorTermSchema),
		})
		.optional(),
	preferredDuringSchedulingIgnoredDuringExecution: z
		.array(
			z.object({
				preference: NodeSelectorTermSchema,
				weight: z.number(),
			}),
		)
		.optional(),
});

// Affinity schema
export const AffinitySchema = z.object({
	nodeAffinity: NodeAffinitySchema.optional(),
	podAffinity: z.any().optional(),
	podAntiAffinity: z.any().optional(),
});

// Environment variable value from schema
export const EnvVarValueFromSchema = z.object({
	secretKeyRef: z
		.object({
			name: z.string(),
			key: z.string(),
		})
		.optional(),
	configMapKeyRef: z
		.object({
			name: z.string(),
			key: z.string(),
		})
		.optional(),
	fieldRef: z
		.object({
			fieldPath: z.string(),
		})
		.optional(),
	resourceFieldRef: z
		.object({
			resource: z.string(),
			containerName: z.string().optional(),
			divisor: z.string().optional(),
		})
		.optional(),
});

// Environment variable schema
export const EnvVarSchema = z.object({
	name: z.string(),
	value: z.string().optional(),
	valueFrom: EnvVarValueFromSchema.optional(),
});

// App port schema
export const AppPortSchema = z.object({
	name: z.string(),
	port: z.number(),
	protocol: z.enum(["TCP", "UDP", "SCTP"]).default("TCP"),
});

// Port schema
export const PortSchema = z.object({
	containerPort: z.number(),
	name: z.string(),
	protocol: z.enum(["TCP", "UDP", "SCTP"]).default("TCP"),
});

// Devbox config schema
export const DevboxConfigSchema = z.object({
	appPorts: z.array(AppPortSchema).optional(),
	env: z.array(EnvVarSchema).optional(),
	labels: z.record(z.string(), z.string()).optional(),
	ports: z.array(PortSchema).optional(),
	releaseArgs: z.array(z.string()).optional(),
	releaseCommand: z.array(z.string()).optional(),
	user: z.string().optional(),
	workingDir: z.string().optional(),
});

// Network schema
export const NetworkSchema = z.object({
	extraPorts: z.array(z.any()).optional(),
	type: z.enum(["NodePort", "ClusterIP", "LoadBalancer"]).default("NodePort"),
});

// Resource schema
export const ResourceSchema = z.object({
	cpu: z.string(),
	memory: z.string(),
});

// Toleration schema
export const TolerationSchema = z.object({
	effect: z.enum(["NoSchedule", "PreferNoSchedule", "NoExecute"]).optional(),
	key: z.string().optional(),
	operator: z.enum(["Equal", "Exists"]).default("Equal"),
	tolerationSeconds: z.number().optional(),
	value: z.string().optional(),
});

// Devbox spec schema
export const DevboxSpecSchema = z.object({
	affinity: AffinitySchema.optional(),
	config: DevboxConfigSchema.optional(),
	image: z.string(),
	network: NetworkSchema.optional(),
	resource: ResourceSchema.optional(),
	squash: z.boolean().optional(),
	state: z.enum(["Running", "Stopped"]).optional(),
	templateID: z.string().optional(),
	tolerations: z.array(TolerationSchema).optional(),
});

// Commit history entry schema
export const CommitHistoryEntrySchema = z.object({
	containerID: z.string(),
	image: z.string(),
	node: z.string(),
	pod: z.string(),
	predicatedStatus: z.string(),
	status: z.string(),
	time: z.string(),
});

// Container state running schema
export const ContainerStateRunningSchema = z.object({
	startedAt: z.string(),
});

// Container state terminated schema
export const ContainerStateTerminatedSchema = z.object({
	containerID: z.string(),
	exitCode: z.number(),
	finishedAt: z.string(),
	reason: z.string(),
	startedAt: z.string(),
});

// Container state waiting schema
export const ContainerStateWaitingSchema = z.object({
	message: z.string().optional(),
	reason: z.string().optional(),
});

// Container state schema
export const ContainerStateSchema = z.object({
	running: ContainerStateRunningSchema.optional(),
	terminated: ContainerStateTerminatedSchema.optional(),
	waiting: ContainerStateWaitingSchema.optional(),
});

// Devbox status schema
export const DevboxStatusSchema = z.object({
	commitHistory: z.array(CommitHistoryEntrySchema).optional(),
	lastState: ContainerStateSchema.optional(),
	network: z
		.object({
			nodePort: z.number().optional(),
			tailnet: z.string().optional(),
			type: z.string().optional(),
		})
		.optional(),
	phase: z.enum(["Running", "Stopped", "Pending", "Failed"]).optional(),
	state: ContainerStateSchema.optional(),
});

// Main Devbox resource schema
export const DevboxResourceSchema = z.object({
	apiVersion: z
		.literal("devbox.sealos.io/v1alpha1")
		.optional()
		.default("devbox.sealos.io/v1alpha1"),
	kind: z.literal("Devbox").optional().default("Devbox"),
	metadata: z.object({
		annotations: z.record(z.string(), z.string()).optional(),
		creationTimestamp: z.string().optional(),
		finalizers: z.array(z.string()).optional(),
		generation: z.number().optional(),
		labels: z.record(z.string(), z.string()).optional(),
		name: z.string(),
		namespace: z.string().optional(),
		resourceVersion: z.string().optional(),
		uid: z.string(),
	}),
	spec: DevboxSpecSchema,
	status: DevboxStatusSchema.optional(),
});

// Type exports
export type NodeSelectorRequirement = z.infer<
	typeof NodeSelectorRequirementSchema
>;
export type NodeSelectorTerm = z.infer<typeof NodeSelectorTermSchema>;
export type NodeAffinity = z.infer<typeof NodeAffinitySchema>;
export type Affinity = z.infer<typeof AffinitySchema>;
export type EnvVarValueFrom = z.infer<typeof EnvVarValueFromSchema>;
export type EnvVar = z.infer<typeof EnvVarSchema>;
export type AppPort = z.infer<typeof AppPortSchema>;
export type Port = z.infer<typeof PortSchema>;
export type DevboxConfig = z.infer<typeof DevboxConfigSchema>;
export type Network = z.infer<typeof NetworkSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type Toleration = z.infer<typeof TolerationSchema>;
export type DevboxSpec = z.infer<typeof DevboxSpecSchema>;
export type CommitHistoryEntry = z.infer<typeof CommitHistoryEntrySchema>;
export type ContainerStateRunning = z.infer<typeof ContainerStateRunningSchema>;
export type ContainerStateTerminated = z.infer<
	typeof ContainerStateTerminatedSchema
>;
export type ContainerStateWaiting = z.infer<typeof ContainerStateWaitingSchema>;
export type ContainerState = z.infer<typeof ContainerStateSchema>;
export type DevboxStatus = z.infer<typeof DevboxStatusSchema>;
export type DevboxResource = z.infer<typeof DevboxResourceSchema>;
