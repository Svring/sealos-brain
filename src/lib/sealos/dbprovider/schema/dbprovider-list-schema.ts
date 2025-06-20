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

const ResourceSchema = z.object({
  cpu: z.string(),
  memory: z.string(),
  storage: z.string().optional(),
});

const TolerationSchema = z.object({
  effect: z.string(),
  key: z.string(),
  operator: z.string(),
});

const BackupPolicySchema = z.object({
  enabled: z.boolean(),
  retentionPeriod: z.string().optional(),
  backupRepo: z.string().optional(),
  schedule: z.string().optional(),
});

const ServicePortSchema = z.object({
  name: z.string(),
  port: z.number(),
  protocol: z.string(),
  targetPort: z.number().optional(),
});

const ComponentStatusSchema = z.object({
  phase: z.string(),
  message: z.string().optional(),
  podNames: z.array(z.string()).optional(),
});

// Main DBProvider (Cluster) schema
const DBProviderSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal("Cluster"),
  metadata: z.object({
    creationTimestamp: z.string(),
    finalizers: z.array(z.string()).optional(),
    generation: z.number().optional(),
    name: z.string(),
    namespace: z.string(),
    resourceVersion: z.string().optional(),
    uid: z.string(),
    labels: z.record(z.string()).optional(),
    annotations: z.record(z.string()).optional(),
  }),
  spec: z.object({
    clusterDefinitionRef: z.string(),
    clusterVersionRef: z.string(),
    terminationPolicy: z.enum(["Delete", "Halt", "DoNotTerminate", "WipeOut"]),
    affinity: z
      .object({
        nodeAffinity: NodeAffinitySchema.optional(),
      })
      .optional(),
    tolerations: z.array(TolerationSchema).optional(),
    resources: z.object({
      cpu: z.string(),
      memory: z.string(),
    }),
    storage: z.object({
      size: z.string(),
      accessModes: z.array(z.string()).optional(),
    }),
    backup: BackupPolicySchema.optional(),
    componentSpecs: z.array(
      z.object({
        name: z.string(),
        componentDefRef: z.string(),
        replicas: z.number(),
        resources: ResourceSchema,
        volumeClaimTemplates: z
          .array(
            z.object({
              name: z.string(),
              spec: z.object({
                accessModes: z.array(z.string()),
                resources: z.object({
                  requests: z.object({
                    storage: z.string(),
                  }),
                }),
              }),
            })
          )
          .optional(),
        services: z
          .array(
            z.object({
              name: z.string(),
              serviceName: z.string(),
              spec: z.object({
                ports: z.array(ServicePortSchema),
                type: z.string().optional(),
              }),
            })
          )
          .optional(),
      })
    ),
  }),
  status: z
    .object({
      phase: z.string(),
      message: z.string().optional(),
      conditions: z
        .array(
          z.object({
            type: z.string(),
            status: z.string(),
            lastTransitionTime: z.string(),
            reason: z.string().optional(),
            message: z.string().optional(),
          })
        )
        .optional(),
      components: z.record(ComponentStatusSchema).optional(),
      observedGeneration: z.number().optional(),
    })
    .optional(),
});

// Top-level schema for the entire data structure
const DataSchema = z.array(DBProviderSchema);

export type DataSchema = z.infer<typeof DataSchema>;
export type DBProviderSchema = z.infer<typeof DBProviderSchema>;
export type ComponentStatus = z.infer<typeof ComponentStatusSchema>;
export type BackupPolicy = z.infer<typeof BackupPolicySchema>;
export type ServicePort = z.infer<typeof ServicePortSchema>;
