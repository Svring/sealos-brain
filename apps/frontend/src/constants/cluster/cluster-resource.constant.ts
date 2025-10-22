// CPU options as numbers for cluster resources
export const CLUSTER_CPU_OPTIONS = [0.5, 1, 2, 4, 8, 16] as const;

// Memory options as numbers for cluster resources (includes 32 GB)
export const CLUSTER_MEMORY_OPTIONS = [0.5, 1, 2, 4, 8, 16, 32] as const;

// Storage options as numbers for cluster resources (1 to 300 as integers)
export const CLUSTER_STORAGE_OPTIONS = Array.from({ length: 300 }, (_, i) => i + 1);

// Replicas options for cluster resources (1 to 20 as integers)
export const CLUSTER_REPLICAS_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

export type ClusterCpuOption = (typeof CLUSTER_CPU_OPTIONS)[number];
export type ClusterMemoryOption = (typeof CLUSTER_MEMORY_OPTIONS)[number];
export type ClusterStorageOption = (typeof CLUSTER_STORAGE_OPTIONS)[number];
export type ClusterReplicasOption = (typeof CLUSTER_REPLICAS_OPTIONS)[number];
