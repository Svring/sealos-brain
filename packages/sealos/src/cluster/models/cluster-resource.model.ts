import { z } from "zod";

// Affinity schemas
export const NodeLabelsSchema = z.object({});

export const AffinitySchema = z.object({
	nodeLabels: NodeLabelsSchema,
	podAntiAffinity: z.enum(["Preferred", "Required"]),
	tenancy: z.enum(["SharedNode", "DedicatedNode"]),
	topologyKeys: z.array(z.string()),
});

// Backup schemas
export const BackupSchema = z.object({
	cronExpression: z.string(),
	enabled: z.boolean(),
	method: z.string(),
	pitrEnabled: z.boolean(),
	repoName: z.string(),
	retentionPeriod: z.string(),
});

// Resource schemas
export const ResourceLimitsSchema = z.object({
	cpu: z.string(),
	memory: z.string(),
});

export const ResourceRequestsSchema = z.object({
	cpu: z.string(),
	memory: z.string(),
});

export const ResourcesSchema = z.object({
	limits: ResourceLimitsSchema,
	requests: ResourceRequestsSchema,
});

// Volume claim template schemas
export const VolumeClaimTemplateSpecSchema = z.object({
	accessModes: z.array(z.string()),
	resources: z.object({
		requests: z.object({
			storage: z.string(),
		}),
	}),
});

export const VolumeClaimTemplateSchema = z.object({
	name: z.string(),
	spec: VolumeClaimTemplateSpecSchema,
});

// Switch policy schema
export const SwitchPolicySchema = z.object({
	type: z.enum(["Noop", "BestEffort", "Guaranteed"]),
});

// Component spec schema
export const ComponentSpecSchema = z.object({
	componentDefRef: z.string(),
	monitor: z.boolean(),
	name: z.string(),
	noCreatePDB: z.boolean(),
	replicas: z.number(),
	resources: ResourcesSchema,
	rsmTransformPolicy: z.string().optional(),
	serviceAccountName: z.string(),
	switchPolicy: SwitchPolicySchema,
	volumeClaimTemplates: z.array(VolumeClaimTemplateSchema).optional(),
});

// Toleration schema
export const TolerationSchema = z.object({
	key: z.string().optional(),
	operator: z.string().optional(),
	value: z.string().optional(),
	effect: z.string().optional(),
	tolerationSeconds: z.number().optional(),
});

// Cluster spec schema
export const ClusterSpecSchema = z.object({
	affinity: AffinitySchema,
	backup: BackupSchema.optional(),
	clusterDefinitionRef: z.string(),
	clusterVersionRef: z.string(),
	componentSpecs: z.array(ComponentSpecSchema),
	terminationPolicy: z.enum(["Delete", "WipeOut"]),
	tolerations: z.array(TolerationSchema),
});

// Component status schema
export const ComponentStatusSchema = z.object({
	phase: z.string(),
	podsReady: z.boolean(),
	podsReadyTime: z.string().optional(),
});

// Condition schema
export const ConditionSchema = z.object({
	lastTransitionTime: z.string(),
	message: z.string(),
	observedGeneration: z.number().optional(),
	reason: z.string(),
	status: z.enum(["True", "False", "Unknown"]),
	type: z.string(),
});

// Cluster status schema
export const ClusterStatusSchema = z.object({
	clusterDefGeneration: z.number(),
	components: z.record(z.string(), ComponentStatusSchema),
	conditions: z.array(ConditionSchema),
	observedGeneration: z.number(),
	phase: z.string(),
});

// Main cluster resource schema
export const ClusterResourceSchema = z.object({
	apiVersion: z
		.literal("apps.kubeblocks.io/v1alpha1")
		.optional()
		.default("apps.kubeblocks.io/v1alpha1"),
	kind: z.literal("Cluster").optional().default("Cluster"),
	metadata: z.object({
		annotations: z.record(z.string(), z.string()).optional(),
		creationTimestamp: z.string(),
		finalizers: z.array(z.string()),
		generation: z.number(),
		labels: z.record(z.string(), z.string()),
		name: z.string(),
		namespace: z.string(),
		resourceVersion: z.string(),
		uid: z.string(),
	}),
	spec: ClusterSpecSchema,
	status: ClusterStatusSchema,
});

// Type exports
export type NodeLabels = z.infer<typeof NodeLabelsSchema>;
export type Affinity = z.infer<typeof AffinitySchema>;
export type Backup = z.infer<typeof BackupSchema>;
export type ResourceLimits = z.infer<typeof ResourceLimitsSchema>;
export type ResourceRequests = z.infer<typeof ResourceRequestsSchema>;
export type Resources = z.infer<typeof ResourcesSchema>;
export type VolumeClaimTemplateSpec = z.infer<
	typeof VolumeClaimTemplateSpecSchema
>;
export type VolumeClaimTemplate = z.infer<typeof VolumeClaimTemplateSchema>;
export type SwitchPolicy = z.infer<typeof SwitchPolicySchema>;
export type ComponentSpec = z.infer<typeof ComponentSpecSchema>;
export type Toleration = z.infer<typeof TolerationSchema>;
export type ClusterSpec = z.infer<typeof ClusterSpecSchema>;
export type ComponentStatus = z.infer<typeof ComponentStatusSchema>;
export type Condition = z.infer<typeof ConditionSchema>;
export type ClusterStatus = z.infer<typeof ClusterStatusSchema>;
export type ClusterResource = z.infer<typeof ClusterResourceSchema>;
