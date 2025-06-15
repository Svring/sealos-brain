import { z } from "zod";

// Common schemas for reused structures
const MatchExpressionSchema = z.object({
  key: z.string(),
  operator: z.string(),
});

const NodeSelectorTermSchema = z.object({
  matchExpressions: z.array(MatchExpressionSchema),
});

const NodeAffinitySchema = z.object({
  requiredDuringSchedulingIgnoredDuringExecution: z.object({
    nodeSelectorTerms: z.array(NodeSelectorTermSchema),
  }),
});

const PortSchema = z.object({
  name: z.string().optional(),
  port: z.number().optional(),
  protocol: z.string(),
  targetPort: z.number().optional(),
  containerPort: z.number().optional(),
});

const ResourceSchema = z.object({
  cpu: z.string(),
  memory: z.string(),
});

const TolerationSchema = z.object({
  effect: z.string(),
  key: z.string(),
  operator: z.string(),
});

const CommitHistorySchema = z.object({
  containerID: z.string(),
  image: z.string(),
  node: z.string(),
  pod: z.string(),
  predicatedStatus: z.string(),
  status: z.string(),
  time: z.string(),
});

const TerminatedStateSchema = z.object({
  containerID: z.string(),
  exitCode: z.number(),
  finishedAt: z.string(),
  reason: z.string(),
  startedAt: z.string(),
});

const RunningStateSchema = z.object({
  startedAt: z.string(),
});

const NetworkStatusSchema = z.object({
  nodePort: z.number(),
  tailnet: z.string(),
  type: z.string(),
});

// Main Devbox schema
const DevboxSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal("Devbox"),
  metadata: z.object({
    creationTimestamp: z.string(),
    finalizers: z.array(z.string()),
    generation: z.number(),
    name: z.string(),
    namespace: z.string(),
    resourceVersion: z.string(),
    uid: z.string(),
  }),
  spec: z.object({
    affinity: z.object({
      nodeAffinity: NodeAffinitySchema,
    }),
    config: z.object({
      appPorts: z.array(PortSchema),
      ports: z.array(PortSchema),
      releaseArgs: z.array(z.string()),
      releaseCommand: z.array(z.string()),
      user: z.string(),
      workingDir: z.string(),
    }),
    image: z.string(),
    network: z.object({
      extraPorts: z.array(PortSchema),
      type: z.string(),
    }),
    resource: ResourceSchema,
    squash: z.boolean(),
    state: z.string(),
    templateID: z.string(),
    tolerations: z.array(TolerationSchema),
  }),
  status: z.object({
    commitHistory: z.array(CommitHistorySchema),
    lastState: z
      .object({
        terminated: TerminatedStateSchema.optional(),
      })
      .optional(),
    network: NetworkStatusSchema,
    phase: z.string(),
    state: z
      .object({
        running: RunningStateSchema.optional(),
      })
      .optional(),
  }),
});

// Template schema
const TemplateSchema = z.object({
  uid: z.string(),
  templateRepository: z.object({
    iconId: z.string(),
  }),
});

// Top-level schema for the entire data structure
const DataSchema = z.array(z.array(z.union([DevboxSchema, TemplateSchema])));

export type DataSchema = z.infer<typeof DataSchema>;
export type DevboxSchema = z.infer<typeof DevboxSchema>;
export type TemplateSchema = z.infer<typeof TemplateSchema>;
