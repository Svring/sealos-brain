import { z } from "zod";

// Re-use some schemas from the list schema
import {
  MetadataSchema,
  DeploymentSpecSchema,
  DeploymentStatusSchema,
} from "./applaunchpad-list-schema";

// Status schema for app detail view
const AppStatusSchema = z.object({
  label: z.string(),
  value: z.string(),
  color: z.string(),
  backgroundColor: z.string(),
  dotColor: z.string(),
});

// GPU schema
const GpuSchema = z.object({
  type: z.string(),
  amount: z.number(),
  manufacturers: z.string(),
});

// Resource usage schema (CPU/Memory metrics)
const ResourceUsageSchema = z.object({
  name: z.string(),
  xData: z.array(z.number()),
  yData: z.array(z.string()),
});

// Environment variable schema
const EnvVarSchema = z.object({
  key: z.string(),
  value: z.string(),
});

// Network configuration schema
const NetworkSchema = z.object({
  networkName: z.string(),
  portName: z.string(),
  port: z.number(),
  openNodePort: z.boolean(),
  protocol: z.string(),
  appProtocol: z.string(),
  openPublicDomain: z.boolean(),
  publicDomain: z.string(),
  customDomain: z.string(),
  domain: z.string(),
});

// HPA (Horizontal Pod Autoscaler) schema
const HpaSchema = z.object({
  use: z.boolean(),
  target: z.string(),
  value: z.number(),
  minReplicas: z.number(),
  maxReplicas: z.number(),
});

// Secret schema
const SecretSchema = z.object({
  use: z.boolean(),
  username: z.string(),
  password: z.string(),
  serverAddress: z.string(),
});

// Source schema
const SourceSchema = z.object({
  hasSource: z.boolean(),
  sourceName: z.string(),
  sourceType: z.string(),
});

// Service port schema
const ServicePortSchema = z.object({
  name: z.string(),
  port: z.number(),
  protocol: z.string(),
  targetPort: z.number(),
});

// Service spec schema
const ServiceSpecSchema = z.object({
  clusterIP: z.string(),
  clusterIPs: z.array(z.string()),
  internalTrafficPolicy: z.string(),
  ipFamilies: z.array(z.string()),
  ipFamilyPolicy: z.string(),
  ports: z.array(ServicePortSchema),
  selector: z.record(z.string()),
  sessionAffinity: z.string(),
  type: z.string(),
});

// Service status schema
const ServiceStatusSchema = z.object({
  loadBalancer: z.object({}),
});

// Service schema
const ServiceSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal("Service"),
  metadata: MetadataSchema,
  spec: ServiceSpecSchema,
  status: ServiceStatusSchema,
});

// Ingress backend schema
const IngressBackendSchema = z.object({
  service: z.object({
    name: z.string(),
    port: z.object({
      number: z.number(),
    }),
  }),
});

// Ingress path schema
const IngressPathSchema = z.object({
  backend: IngressBackendSchema,
  path: z.string(),
  pathType: z.string(),
});

// Ingress HTTP schema
const IngressHttpSchema = z.object({
  paths: z.array(IngressPathSchema),
});

// Ingress rule schema
const IngressRuleSchema = z.object({
  host: z.string(),
  http: IngressHttpSchema,
});

// Ingress TLS schema
const IngressTlsSchema = z.object({
  hosts: z.array(z.string()),
  secretName: z.string(),
});

// Ingress spec schema
const IngressSpecSchema = z.object({
  rules: z.array(IngressRuleSchema),
  tls: z.array(IngressTlsSchema),
});

// Ingress status schema
const IngressStatusSchema = z.object({
  loadBalancer: z.object({}),
});

// Ingress schema
const IngressSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal("Ingress"),
  metadata: MetadataSchema,
  spec: IngressSpecSchema,
  status: IngressStatusSchema,
});

// Deployment schema (reuse from list schema)
const DeploymentSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal("Deployment"),
  metadata: MetadataSchema,
  spec: DeploymentSpecSchema,
  status: DeploymentStatusSchema,
});

// Union type for Kubernetes resources
const KubernetesResourceSchema = z.union([
  DeploymentSchema,
  ServiceSchema,
  IngressSchema,
]);

// Main app detail data schema
const AppDetailDataSchema = z.object({
  labels: z.record(z.string()),
  crYamlList: z.array(KubernetesResourceSchema),
  id: z.string(),
  appName: z.string(),
  createTime: z.string(),
  status: AppStatusSchema,
  isPause: z.boolean(),
  imageName: z.string(),
  runCMD: z.string(),
  cmdParam: z.string(),
  replicas: z.number(),
  cpu: z.number(),
  memory: z.number(),
  gpu: GpuSchema,
  usedCpu: ResourceUsageSchema,
  usedMemory: ResourceUsageSchema,
  envs: z.array(EnvVarSchema),
  networks: z.array(NetworkSchema),
  hpa: HpaSchema,
  configMapList: z.array(z.any()), // Define more specifically if needed
  secret: SecretSchema,
  storeList: z.array(z.any()), // Define more specifically if needed
  volumeMounts: z.array(z.any()), // Define more specifically if needed
  volumes: z.array(z.any()), // Define more specifically if needed
  kind: z.string(),
  source: SourceSchema,
});

// API response schema
const AppDetailResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: AppDetailDataSchema,
});

// Export types
export type AppDetailResponse = z.infer<typeof AppDetailResponseSchema>;
export type AppDetailData = z.infer<typeof AppDetailDataSchema>;
export type AppStatus = z.infer<typeof AppStatusSchema>;
export type Gpu = z.infer<typeof GpuSchema>;
export type ResourceUsage = z.infer<typeof ResourceUsageSchema>;
export type EnvVar = z.infer<typeof EnvVarSchema>;
export type Network = z.infer<typeof NetworkSchema>;
export type Hpa = z.infer<typeof HpaSchema>;
export type Secret = z.infer<typeof SecretSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type KubernetesResource = z.infer<typeof KubernetesResourceSchema>;
export type ServiceSpec = z.infer<typeof ServiceSpecSchema>;
export type IngressSpec = z.infer<typeof IngressSpecSchema>;

// Export schemas
export {
  AppDetailResponseSchema,
  AppDetailDataSchema,
  AppStatusSchema,
  GpuSchema,
  ResourceUsageSchema,
  EnvVarSchema,
  NetworkSchema,
  HpaSchema,
  SecretSchema,
  SourceSchema,
  KubernetesResourceSchema,
  DeploymentSchema,
  ServiceSchema,
  IngressSchema,
  ServiceSpecSchema,
  IngressSpecSchema,
};
