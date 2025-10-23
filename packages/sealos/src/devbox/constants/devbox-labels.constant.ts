export const DEVBOX_LABELS = {
	/** Label used for devbox-related resources like backups in devbox deletion */
	// ingress, service
	DEVBOX_MANAGER: "cloud.sealos.io/devbox-manager",
	// secret, pod
	APP_KUBERNETES_NAME: "app.kubernetes.io/name",
	// deployments from devbox
	APP_DEVBOX_ID: "cloud.sealos.io/app-devbox-id",
} as const;
