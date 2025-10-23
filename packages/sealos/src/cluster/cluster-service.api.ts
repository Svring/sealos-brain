"use server";

import {
	BUILTIN_RESOURCES,
	CUSTOM_RESOURCES,
} from "@sealos-brain/constants/k8s";
import { selectResources } from "@sealos-brain/lib/k8s-service";
import { CLUSTER_LABELS } from "@/constants/cluster/cluster-labels.constant";
import { transformMonitorData } from "@/lib/resource/resource.utils";
import type { ResourceTypeTarget } from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s-custom.model";
import type { K8sResource } from "@/mvvm/k8s/models/k8s-resource.model";
import type { MonitorData } from "@/mvvm/resource/models/resource-monitor.model";
import { getClusterMonitorData } from "./cluster.api";

// ============================================================================
// Cluster Service Functions (Higher-level business logic)
// ============================================================================

/**
 * Get cluster combined monitor
 */
export const getClusterMonitor = async (
	context: K8sContext,
	dbName: string,
	dbType: string,
) => {
	const [cpuResult, memoryResult, diskResult] = await Promise.allSettled([
		getClusterMonitorData(context, dbName, dbType, "cpu"),
		getClusterMonitorData(context, dbName, dbType, "memory"),
		getClusterMonitorData(context, dbName, dbType, "disk"),
	]);

	const cpuData =
		cpuResult.status === "fulfilled" ? cpuResult.value : undefined;
	const memoryData =
		memoryResult.status === "fulfilled" ? memoryResult.value : undefined;
	const storageData =
		diskResult.status === "fulfilled" ? diskResult.value : undefined;

	// Transform combined monitor data
	const monitorData: MonitorData = {
		cpu: cpuData ? { data: cpuData } : undefined,
		memory: memoryData ? { data: memoryData } : undefined,
		storage: storageData ? { data: storageData } : undefined,
	};

	return transformMonitorData(monitorData);
};

/**
 * Get cluster related resources
 * @param context - K8s context
 * @param target - Cluster target
 * @param resources - Array of resource types to fetch (both builtin and custom)
 * @returns Array of K8sResource objects
 */
export const getClusterResources = async (
	context: K8sContext,
	target: CustomResourceTarget,
	resources: string[] = [
		"serviceaccount",
		"role",
		"rolebinding",
		"secret",
		"pod",
		"cronjob",
		"backup",
	],
): Promise<K8sResource[]> => {
	const clusterName = target.name;

	// Type guards
	const isBuiltinResource = (
		resource: string,
	): resource is keyof typeof BUILTIN_RESOURCES =>
		resource in BUILTIN_RESOURCES;

	const isCustomResource = (
		resource: string,
	): resource is keyof typeof CUSTOM_RESOURCES => resource in CUSTOM_RESOURCES;

	// Separate resources by type
	const builtinResources = resources.filter((resource) =>
		isBuiltinResource(resource),
	);

	const customResources = resources.filter((resource) =>
		isCustomResource(resource),
	);

	// Build targets for cluster resources using APP_KUBERNETES_INSTANCE label
	const targets: ResourceTypeTarget[] = [
		// Builtin resources
		...builtinResources.map((resourceType) => ({
			type: "builtin" as const,
			resourceType: resourceType,
			name: clusterName,
			label: CLUSTER_LABELS.APP_KUBERNETES_INSTANCE,
		})),
		// Custom resources
		...customResources.map((resourceType) => ({
			type: "custom" as const,
			resourceType: resourceType,
			name: clusterName,
			label: CLUSTER_LABELS.APP_KUBERNETES_INSTANCE,
		})),
	];

	return selectResources(context, targets);
};
