"use server";

import { selectResources } from "@sealos-brain/k8s/shared/api";
import {
	BUILTIN_RESOURCES,
	CUSTOM_RESOURCES,
} from "@sealos-brain/k8s/shared/constants";
import type {
	CustomResourceTarget,
	K8sContext,
	K8sResource,
	ResourceTypeTarget,
} from "@sealos-brain/k8s/shared/models";
import { fromPromise, type ResultAsync } from "neverthrow";
import { CLUSTER_LABELS } from "#cluster/constants/cluster-labels.constant";

// ============================================================================
// Cluster Service Functions (Higher-level business logic)
// ============================================================================

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
): Promise<ResultAsync<K8sResource[], Error>> => {
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

	return fromPromise(selectResources(context, targets), (error) => error as Error);
};
