"use server";

import { POD_LABELS } from "@/constants/pod/pod-label.constant";
import { k8sParser } from "@/lib/k8s/k8s.parser";
import { listResources } from "@/lib/k8s/k8s-service.api";
import { podParser } from "@/lib/sealos/pod/pod.parser";
import type { ResourceTarget } from "@/models/k8s/k8s.model";
import type { K8sContext } from "@/models/k8s/k8s-context.model";

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
