// CPU options as numbers for devbox resources
export const DEVBOX_CPU_OPTIONS = [0.5, 1, 2, 4, 8, 16] as const;

// Memory options as numbers for devbox resources
export const DEVBOX_MEMORY_OPTIONS = [0.5, 1, 2, 4, 8, 16, 32] as const;

export type DevboxCpuOption = (typeof DEVBOX_CPU_OPTIONS)[number];
export type DevboxMemoryOption = (typeof DEVBOX_MEMORY_OPTIONS)[number];
