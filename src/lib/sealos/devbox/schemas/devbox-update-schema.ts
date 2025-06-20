import { z } from "zod";

// Devbox schemas
const DevboxConfigPortSchema = z.object({
  port: z.number(),
  name: z.string(),
  protocol: z.string(),
  targetPort: z.number(),
});

const DevboxConfigSchema = z.object({
  appPorts: z.array(DevboxConfigPortSchema),
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

const DevboxSpecSchema = z.object({
  squash: z.boolean(),
  network: z.object({
    type: z.string(),
    extraPorts: z.array(
      z.object({
        containerPort: z.number(),
      })
    ),
  }),
  resource: z.object({
    cpu: z.string(),
    memory: z.string(),
  }),
  templateID: z.string(),
  image: z.string(),
  config: DevboxConfigSchema,
  state: z.string(),
  tolerations: z.array(
    z.object({
      key: z.string(),
      operator: z.string(),
      effect: z.string(),
    })
  ),
  affinity: z.object({
    nodeAffinity: z.object({
      requiredDuringSchedulingIgnoredDuringExecution: z.object({
        nodeSelectorTerms: z.array(
          z.object({
            matchExpressions: z.array(
              z.object({
                key: z.string(),
                operator: z.string(),
              })
            ),
          })
        ),
      }),
    }),
  }),
});

const DevboxSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal("Devbox"),
  metadata: z.object({
    name: z.string(),
  }),
  spec: DevboxSpecSchema,
});

// Service schemas
const ServicePortSchema = z.object({
  port: z.number(),
  targetPort: z.number(),
  name: z.string(),
});

const ServiceSpecSchema = z.object({
  ports: z.array(ServicePortSchema),
  selector: z.record(z.string()),
});

const ServiceSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal("Service"),
  metadata: z.object({
    name: z.string(),
    labels: z.record(z.string()),
  }),
  spec: ServiceSpecSchema,
});

// Ingress schemas
const IngressBackendSchema = z.object({
  service: z.object({
    name: z.string(),
    port: z.object({
      number: z.number(),
    }),
  }),
});

const IngressPathSchema = z.object({
  pathType: z.string(),
  path: z.string(),
  backend: IngressBackendSchema,
});

const IngressRuleSchema = z.object({
  host: z.string(),
  http: z.object({
    paths: z.array(IngressPathSchema),
  }),
});

const IngressTLSSchema = z.object({
  hosts: z.array(z.string()),
  secretName: z.string(),
});

const IngressSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal("Ingress"),
  metadata: z.object({
    name: z.string(),
    labels: z.record(z.string()),
    annotations: z.record(z.string()),
  }),
  spec: z.object({
    rules: z.array(IngressRuleSchema),
    tls: z.array(IngressTLSSchema),
  }),
});

// Operation schema with union for value
const OperationSchema = z.object({
  type: z.string(),
  kind: z.string(),
  value: z.union([
    DevboxSchema,
    ServiceSchema,
    IngressSchema,
    z.string().transform((val, ctx) => {
      // For Ingress, the value might be a YAML string; attempt to parse it
      try {
        // Note: In a real implementation, you'd use a YAML parser like js-yaml
        // Here, we assume the string is valid and matches IngressSchema
        return JSON.parse(val); // Placeholder; replace with YAML parsing
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid YAML string for Ingress",
        });
        return z.NEVER;
      }
    }),
  ]),
  devboxName: z.string().optional(),
});

// Root schema
const RootSchema = z.object({
  patch: z.array(OperationSchema),
});

// Export the schema
export { RootSchema };
