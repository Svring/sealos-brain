import { z } from "zod";

// Environment variable schema
const EnvVarSchema = z.object({
  name: z.string(),
  value: z.string(),
});

// Port schema
const PortSchema = z.object({
  containerPort: z.number(),
  name: z.string(),
  protocol: z.string(),
});

// Resource schema
const ResourceSchema = z.object({
  limits: z.object({
    cpu: z.string(),
    memory: z.string(),
  }),
  requests: z.object({
    cpu: z.string(),
    memory: z.string(),
  }),
});

// Container schema
const ContainerSchema = z.object({
  args: z.array(z.string()),
  command: z.array(z.string()),
  env: z.array(EnvVarSchema),
  image: z.string(),
  imagePullPolicy: z.string(),
  name: z.string(),
  ports: z.array(PortSchema),
  resources: ResourceSchema,
  terminationMessagePath: z.string(),
  terminationMessagePolicy: z.string(),
});

// Rolling update strategy schema
const RollingUpdateSchema = z.object({
  maxSurge: z.number(),
  maxUnavailable: z.number(),
});

// Strategy schema
const StrategySchema = z.object({
  rollingUpdate: RollingUpdateSchema,
  type: z.string(),
});

// Pod template spec schema
const PodTemplateSpecSchema = z.object({
  automountServiceAccountToken: z.boolean(),
  containers: z.array(ContainerSchema),
  dnsPolicy: z.string(),
  restartPolicy: z.string(),
  schedulerName: z.string(),
  securityContext: z.object({}),
  terminationGracePeriodSeconds: z.number(),
});

// Pod template metadata schema
const PodTemplateMetadataSchema = z.object({
  creationTimestamp: z.string().nullable(),
  labels: z.object({
    app: z.string(),
    restartTime: z.string(),
  }),
});

// Pod template schema
const PodTemplateSchema = z.object({
  metadata: PodTemplateMetadataSchema,
  spec: PodTemplateSpecSchema,
});

// Selector schema
const SelectorSchema = z.object({
  matchLabels: z.object({
    app: z.string(),
  }),
});

// Deployment spec schema
const DeploymentSpecSchema = z.object({
  progressDeadlineSeconds: z.number(),
  replicas: z.number(),
  revisionHistoryLimit: z.number(),
  selector: SelectorSchema,
  strategy: StrategySchema,
  template: PodTemplateSchema,
});

// Condition schema
const ConditionSchema = z.object({
  lastTransitionTime: z.string(),
  lastUpdateTime: z.string(),
  message: z.string(),
  reason: z.string(),
  status: z.string(),
  type: z.string(),
});

// Deployment status schema
const DeploymentStatusSchema = z.object({
  conditions: z.array(ConditionSchema),
  observedGeneration: z.number(),
  replicas: z.number(),
  unavailableReplicas: z.number().optional(),
  updatedReplicas: z.number(),
  availableReplicas: z.number().optional(),
  readyReplicas: z.number().optional(),
});

// Managed fields schema (simplified as it's quite complex)
const ManagedFieldSchema = z.object({
  apiVersion: z.string(),
  fieldsType: z.string(),
  fieldsV1: z.any(), // This is extremely complex, using any for now
  manager: z.string(),
  operation: z.string(),
  subresource: z.string().optional(),
  time: z.string(),
});

// Metadata schema
const MetadataSchema = z.object({
  annotations: z.record(z.string()),
  creationTimestamp: z.string(),
  generation: z.number(),
  labels: z.record(z.string()),
  managedFields: z.array(ManagedFieldSchema),
  name: z.string(),
  namespace: z.string(),
  resourceVersion: z.string(),
  uid: z.string(),
});

// Main deployment schema
const DeploymentSchema = z.object({
  metadata: MetadataSchema,
  spec: DeploymentSpecSchema,
  status: DeploymentStatusSchema,
});

// API response schema
const AppLaunchpadListResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.array(DeploymentSchema),
});

// Data schema (just the array part)
const AppLaunchpadListDataSchema = z.array(DeploymentSchema);

// Export types
export type AppLaunchpadDeployment = z.infer<typeof DeploymentSchema>;
export type AppLaunchpadListResponse = z.infer<
  typeof AppLaunchpadListResponseSchema
>;
export type AppLaunchpadListData = z.infer<typeof AppLaunchpadListDataSchema>;
export type AppLaunchpadMetadata = z.infer<typeof MetadataSchema>;
export type AppLaunchpadSpec = z.infer<typeof DeploymentSpecSchema>;
export type AppLaunchpadStatus = z.infer<typeof DeploymentStatusSchema>;
export type AppLaunchpadCondition = z.infer<typeof ConditionSchema>;
export type AppLaunchpadContainer = z.infer<typeof ContainerSchema>;
export type AppLaunchpadResource = z.infer<typeof ResourceSchema>;

// Export schemas
export {
  DeploymentSchema,
  AppLaunchpadListResponseSchema,
  AppLaunchpadListDataSchema,
  MetadataSchema,
  DeploymentSpecSchema,
  DeploymentStatusSchema,
  ConditionSchema,
  ContainerSchema,
  ResourceSchema,
};
