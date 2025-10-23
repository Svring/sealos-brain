// Pod label constants for different resource types
export const POD_LABELS = {
	// Custom resources
	devbox: "app.kubernetes.io/name",
	cluster: "app.kubernetes.io/instance",
	instance: "app.kubernetes.io/name",
	app: "app.kubernetes.io/name",

	// Builtin resources
	deployment: "app",
	statefulset: "app",
	daemonset: "app",
	job: "app",
	cronjob: "app",

	// Default fallback
	default: "app",
} as const;

export type PodLabelKey = keyof typeof POD_LABELS;
