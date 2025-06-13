import { z } from "zod";

// Schema for templateConfig (parsed from JSON string)
const TemplateConfigSchema = z.object({
  appPorts: z.array(
    z.object({
      name: z.string(),
      port: z.number(),
      protocol: z.string(),
      targetPort: z.number(),
    })
  ),
  ports: z.array(
    z.object({
      containerPort: z.number(),
      name: z.string(),
      protocol: z.string(),
    })
  ),
  releaseArgs: z.array(z.string()),
  releaseCommand: z.array(z.string()),
  user: z.string(),
  workingDir: z.string(),
});

// Schema for status
const StatusSchema = z.object({
  label: z.string(),
  value: z.string(),
  color: z.string(),
  backgroundColor: z.string(),
  dotColor: z.string(),
});

// Schema for GPU
const GpuSchema = z.object({
  type: z.string(),
  amount: z.number(),
  manufacturers: z.string(),
});

// Schema for resource usage (usedCpu and usedMemory)
const ResourceUsageSchema = z.object({
  name: z.string(),
  xData: z.array(z.number()),
  yData: z.array(z.string()),
});

// Schema for networks
const NetworkSchema = z.object({
  portName: z.string(),
  port: z.number(),
  protocol: z.string(),
  networkName: z.string(),
  openPublicDomain: z.boolean(),
  publicDomain: z.string(),
  customDomain: z.string(),
});

// Main Devbox schema
const DevboxDataSchema = z.object({
  data: z.object({
    id: z.string(),
    name: z.string(),
    templateUid: z.string(),
    templateName: z.string(),
    templateRepositoryName: z.string(),
    templateRepositoryUid: z.string(),
    templateConfig: z
      .string()
      .transform((str) => JSON.parse(str))
      .pipe(TemplateConfigSchema),
    image: z.string(),
    iconId: z.string(),
    status: StatusSchema,
    sshPort: z.number(),
    isPause: z.boolean(),
    createTime: z.string(),
    cpu: z.number(),
    memory: z.number(),
    gpu: GpuSchema,
    usedCpu: ResourceUsageSchema,
    usedMemory: ResourceUsageSchema,
    networks: z.array(NetworkSchema),
    lastTerminatedReason: z.string(),
  }),
});

export { DevboxDataSchema };
