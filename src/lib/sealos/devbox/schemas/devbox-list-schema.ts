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

interface DevboxSpec {
  image: string;
  state: string;
  templateID: string;
  resource: {
    cpu: string;
    memory: string;
  };
  config: {
    appPorts: Array<{
      name: string;
      port: number;
      protocol: string;
      targetPort: number;
    }>;
    ports: Array<{
      containerPort: number;
      name: string;
      protocol: string;
    }>;
    releaseArgs: string[];
    releaseCommand: string[];
    user: string;
    workingDir: string;
  };
  network: {
    extraPorts: Array<{
      containerPort: number;
      protocol: string;
    }>;
    type: string;
  };
  squash: boolean;
  affinity: {
    nodeAffinity: {
      requiredDuringSchedulingIgnoredDuringExecution: {
        nodeSelectorTerms: Array<{
          matchExpressions: Array<{
            key: string;
            operator: string;
          }>;
        }>;
      };
    };
  };
  tolerations: Array<{
    effect: string;
    key: string;
    operator: string;
  }>;
}

interface DevboxStatus {
  phase: string;
  network: {
    nodePort: number;
    tailnet: string;
    type: string;
  };
  state: {
    running?: {
      startedAt: string;
    };
  };
  lastState: {
    terminated?: {
      containerID: string;
      exitCode: number;
      finishedAt: string;
      reason: string;
      startedAt: string;
    };
  };
  commitHistory: Array<{
    containerID: string;
    image: string;
    node: string;
    pod: string;
    predicatedStatus: string;
    status: string;
    time: string;
  }>;
}

interface DevboxMetadata {
  name: string;
  namespace: string;
  uid: string;
  creationTimestamp: string;
  generation: number;
  resourceVersion: string;
  finalizers: string[];
  annotations?: {
    [key: string]: string;
  };
  managedFields: Array<{
    apiVersion: string;
    fieldsType: string;
    fieldsV1: object;
    manager: string;
    operation: string;
    time: string;
    subresource?: string;
  }>;
}

export interface DevboxItem {
  apiVersion: string;
  kind: string;
  metadata: DevboxMetadata;
  spec: DevboxSpec;
  status: DevboxStatus;
}

export interface DevboxList {
  apiVersion: string;
  kind: string;
  metadata: {
    continue: string;
    resourceVersion: string;
  };
  items: DevboxItem[];
}

// Helper interface for simplified display
export interface DevboxSummary {
  name: string;
  template: string;
  status: string;
  phase: string;
  createdAt: string;
  image: string;
  cpu: string;
  memory: string;
  ports: string[];
}

// Function to extract simple info from DevboxItem
export function extractDevboxSummary(devbox: DevboxItem): DevboxSummary {
  // Extract template name from image or use templateID
  const getTemplateName = (image: string): string => {
    // Extract template from image URL like "ghcr.io/labring-actions/devbox/go-1.23.0:13aacd8"
    const imageParts = image.split("/");
    if (imageParts.length > 3) {
      const templatePart = imageParts[3]; // "go-1.23.0:13aacd8"
      return templatePart.split(":")[0]; // "go-1.23.0"
    }
    return devbox.spec.templateID || "Unknown";
  };

  // Format ports for display
  const formatPorts = (
    appPorts: DevboxSpec["config"]["appPorts"]
  ): string[] => {
    return appPorts.map(
      (port) => `${port.port}/${port.protocol.toLowerCase()}`
    );
  };

  // Format creation date
  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  return {
    name: devbox.metadata.name,
    template: getTemplateName(devbox.spec.image),
    status: devbox.spec.state,
    phase: devbox.status.phase,
    createdAt: formatDate(devbox.metadata.creationTimestamp),
    image: devbox.spec.image,
    cpu: devbox.spec.resource.cpu,
    memory: devbox.spec.resource.memory,
    ports: formatPorts(devbox.spec.config.appPorts),
  };
}

// Function to extract summaries from DevboxList
export function extractDevboxListSummaries(
  devboxList: DevboxList
): DevboxSummary[] {
  return devboxList.items.map(extractDevboxSummary);
}
