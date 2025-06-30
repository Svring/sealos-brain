// Resource definitions (copied from k8s-actions.ts for shared use)
export const RESOURCES = {
  devbox: {
    group: "devbox.sealos.io",
    version: "v1alpha1",
    plural: "devboxes",
  },
  cluster: {
    group: "apps.kubeblocks.io",
    version: "v1alpha1",
    plural: "clusters",
  },
  deployment: {
    apiVersion: "apps/v1",
    kind: "Deployment",
  },
  cronjob: {
    apiVersion: "batch/v1",
    kind: "CronJob",
  },
  objectstoragebucket: {
    group: "objectstorage.sealos.io",
    version: "v1",
    plural: "objectstoragebuckets",
  },
};

export type ResourceType = keyof typeof RESOURCES;

// Shared keys for graph functionality
// Changed from annotation to label for graphName, but keep edges as annotation
export const GRAPH_NAME_LABEL_KEY = "sealosBrain.graphName";
export const GRAPH_EDGES_ANNOTATION_KEY = "sealosBrain/graphEdges";
