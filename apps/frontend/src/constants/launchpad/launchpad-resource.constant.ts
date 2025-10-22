// CPU options as numbers for launchpad resources
export const LAUNCHPAD_CPU_OPTIONS = [0.5, 1, 2, 4, 8, 16] as const;

// Memory options as numbers for launchpad resources
export const LAUNCHPAD_MEMORY_OPTIONS = [0.5, 1, 2, 4, 8, 16, 32] as const;

// Replicas options for launchpad resources (1 to 20 as integers)
export const LAUNCHPAD_REPLICAS_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

export type LaunchpadCpuOption = (typeof LAUNCHPAD_CPU_OPTIONS)[number];
export type LaunchpadMemoryOption = (typeof LAUNCHPAD_MEMORY_OPTIONS)[number];
export type LaunchpadReplicasOption = (typeof LAUNCHPAD_REPLICAS_OPTIONS)[number];
