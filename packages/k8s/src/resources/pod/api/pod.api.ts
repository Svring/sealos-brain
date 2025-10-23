"use server";

import { POD_LABELS } from "@/resources/pod/constants/pod-label.constant";
import { podParser } from "@/resources/pod/utils/pod.parser";
import { listResources } from "@/shared/api/k8s-service.api";
import type { K8sContext, ResourceTarget } from "@/shared/models/k8s.model";
import { k8sParser } from "@/shared/utils/k8s.parser";

/**
 * Get pods associated with a resource.
 * This function encapsulates the logic from the pods tRPC procedure.
 *
 * @example
 * ```typescript
 * const pods = await getResourcePods(context, {
 *   type: "custom",
 *   resourceType: "devbox",
 *   name: "my-devbox"
 * });
 * ```
 */
export const getResourcePods = async (
	context: K8sContext,
	target: ResourceTarget,
) => {
	// Determine the appropriate label key based on resource type
	const labelKey = POD_LABELS[target.resourceType as keyof typeof POD_LABELS];
	if (!labelKey) {
		throw new Error(`Unknown resource type: ${target.resourceType}`);
	}

	// Get pods using the resource name and label key
	const podTarget = k8sParser.fromTypeToTarget("pod", target.name, labelKey);

	const podList = await listResources(context, podTarget);

	// Convert raw pod resources to pod objects
	return podParser.toObjects(podList.items || []);
};
