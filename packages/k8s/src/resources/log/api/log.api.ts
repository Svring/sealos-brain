"use server";

import { getResourcePods } from "#resources/pod/api/pod.api";
import type {
	BuiltinResourceTarget,
	K8sContext,
	ResourceTarget,
} from "#shared/models";
import {
	getApiClients,
	getCurrentNamespace,
	invokeApiMethod,
} from "#shared/utils";

/**
 * Get logs for all pods associated with a resource.
 * This function uses getResourcePods to get pods and then fetches logs for each pod.
 *
 * @example
 * ```typescript
 * const logs = await getResourceLogs(context, {
 *   type: "custom",
 *   resourceType: "devbox",
 *   name: "my-devbox"
 * });
 * ```
 */
export const getResourceLogs = async (
	context: K8sContext,
	target: ResourceTarget,
) => {
	// Get pods associated with the resource
	const pods = await getResourcePods(context, target);

	if (pods.length === 0) {
		return {};
	}

	// Get logs for each pod in parallel
	const logsPromises = pods.map(async (pod: any) => {
		try {
			const podTarget = {
				type: "builtin" as const,
				resourceType: "pod" as const,
				name: pod.name,
			};

			const logs = await getLogsByPod(context, podTarget);

			return {
				podName: pod.name,
				logs: logs as string,
				success: true,
			};
		} catch (error) {
			console.warn(`Failed to fetch logs for pod ${pod.name}:`, error);
			return {
				podName: pod.name,
				logs: "",
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	});

	const results = await Promise.all(logsPromises);

	// Convert array to record format
	const logsRecord: Record<
		string,
		{ logs: string; success: boolean; error?: string }
	> = {};
	for (const result of results) {
		logsRecord[result.podName] = {
			logs: result.logs,
			success: result.success,
			error: result.error,
		};
	}

	return logsRecord;
};

/**
 * Get logs for a specific pod.
 *
 * @example
 * ```typescript
 * const podLogs = await getLogsByPod(context, { type: "builtin", resourceType: "pod", name: "my-pod-name" });
 * ```
 */
export const getLogsByPod = async (
	context: K8sContext,
	target: BuiltinResourceTarget,
) => {
	const { clients } = await getApiClients(context.kubeconfig);
	const namespace = await getCurrentNamespace(context.kubeconfig);

	if (!namespace) {
		throw new Error("Namespace is required but not found in kubeconfig");
	}

	const logResponse = await invokeApiMethod(
		clients.coreApi,
		"readNamespacedPodLog",
		{
			namespace,
			name: target.name,
		},
	);

	return logResponse;
};
