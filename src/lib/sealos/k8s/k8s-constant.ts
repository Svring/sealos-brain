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
  network: {
    // Network is a virtual resource type derived from devbox networks
    // It doesn't have direct Kubernetes resources but represents exposed services
    virtual: true,
    description: "Network endpoints from devbox services",
  },
};

// Define resource types
export type ResourceType =
  | "devbox"
  | "cluster"
  | "deployment"
  | "cronjob"
  | "objectstoragebucket"
  | "network";

// Graph-related annotations and labels
export const GRAPH_NAME_LABEL_KEY = "sealos-brain.io/graph-name";
export const GRAPH_EDGES_ANNOTATION_KEY = "sealos-brain.io/graph-edges";
