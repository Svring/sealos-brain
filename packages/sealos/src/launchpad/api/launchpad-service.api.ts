"use server";

import { selectResources } from "@sealos-brain/k8s/shared/api";
import {
	BUILTIN_RESOURCES,
	CUSTOM_RESOURCES,
} from "@sealos-brain/k8s/shared/constants";
import type {
	BuiltinResourceTarget,
	K8sContext,
	K8sResource,
	ResourceTypeTarget,
} from "@sealos-brain/k8s/shared/models";
import { checkPorts } from "@sealos-brain/shared/network/api";
import type { MonitorData } from "#resource/models/resource-monitor.model";
import { transformMonitorData } from "#resource/utils/resource.utils";
import { LAUNCHPAD_LABELS } from "../constants/launchpad-labels.constant";
import { getLaunchpad, getLaunchpadMonitorData } from "./launchpad.api";

// ============================================================================
// Launchpad Service Functions (Higher-level business logic)
// ============================================================================

/**
 * Get launchpad combined monitor
 */
export const getLaunchpadMonitor = async (
	context: K8sContext,
	queryName: string,
	step: string = "2m",
) => {
	const [cpuResult, memoryResult] = await Promise.allSettled([
		getLaunchpadMonitorData(context, "average_cpu", queryName, step),
		getLaunchpadMonitorData(context, "average_memory", queryName, step),
	]);

	const cpuData =
		cpuResult.status === "fulfilled" ? cpuResult.value : undefined;
	const memoryData =
		memoryResult.status === "fulfilled" ? memoryResult.value : undefined;

	// Transform combined monitor data
	const monitorData: MonitorData = {
		cpu: cpuData ? { data: cpuData } : undefined,
		memory: memoryData ? { data: memoryData } : undefined,
	};

	return transformMonitorData(monitorData);
};

/**
 * Get launchpad related resources
 * @param context - K8s context
 * @param target - Launchpad target
 * @param resources - Array of resource types to fetch (both builtin and custom)
 * @returns Array of K8sResource objects
 */
export const getLaunchpadResources = async (
	context: K8sContext,
	target: BuiltinResourceTarget,
	resources: string[] = [
		"ingress",
		"service",
		"pvc",
		"configmap",
		"pod",
		"issuer",
		"certificate",
	],
): Promise<K8sResource[]> => {
	const launchpadName = target.name;

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

	// Check if pod is in the builtin resources (special handling for pod)
	const hasPod = builtinResources.includes("pod");

	if (hasPod) {
		// Remove pod from the main query
		const resourcesWithoutPod = builtinResources.filter(
			(resource) => resource !== "pod",
		);

		// Build targets for resources with APP_DEPLOY_MANAGER label
		const mainTargets: ResourceTypeTarget[] = [
			...resourcesWithoutPod.map((resourceType) => ({
				type: "builtin" as const,
				resourceType: resourceType,
				name: launchpadName,
				label: LAUNCHPAD_LABELS.APP_DEPLOY_MANAGER,
			})),
			...customResources.map((resourceType) => ({
				type: "custom" as const,
				resourceType: resourceType,
				name: launchpadName,
				label: LAUNCHPAD_LABELS.APP_DEPLOY_MANAGER,
			})),
		];

		// Build targets for pods with APP label
		const podTargets: ResourceTypeTarget[] = [
			{
				type: "builtin" as const,
				resourceType: "pod",
				name: launchpadName,
				label: LAUNCHPAD_LABELS.APP,
			},
		];

		// Get resources from both label strategies
		const [mainResources, podResources] = await Promise.all([
			selectResources(context, mainTargets),
			selectResources(context, podTargets),
		]);

		// Merge and return both results
		return [...mainResources, ...podResources];
	} else {
		// Original behavior when pod is not included
		const targets: ResourceTypeTarget[] = [
			// Builtin resources
			...builtinResources.map((resourceType) => ({
				type: "builtin" as const,
				resourceType: resourceType,
				name: launchpadName,
				label: LAUNCHPAD_LABELS.APP_DEPLOY_MANAGER,
			})),
			// Custom resources
			...customResources.map((resourceType) => ({
				type: "custom" as const,
				resourceType: resourceType,
				name: launchpadName,
				label: LAUNCHPAD_LABELS.APP_DEPLOY_MANAGER,
			})),
		];

		return selectResources(context, targets);
	}
};

/**
 * Get launchpad network status by checking port reachability
 * @param context - K8s context
 * @param target - Launchpad target
 * @returns Launchpad ports with reachability status for public and private addresses
 */
export const getLaunchpadNetwork = async (
	context: K8sContext,
	target: BuiltinResourceTarget,
) => {
	// Get the launchpad object first
	const launchpad = await getLaunchpad(context, target);

	// Extract ports from the launchpad object
	const ports = launchpad.ports || [];

	// Check reachability for each port
	const portChecks = await Promise.all(
		ports.map(async (port) => {
			const results: {
				port: typeof port;
				publicReachable?: boolean;
				privateReachable?: boolean;
			} = {
				port,
			};

			// Check public address reachability if available
			if (port.publicHost) {
				try {
					const publicResults = await checkPorts(
						[port.number],
						port.publicHost,
					);
					results.publicReachable = publicResults[0]?.reachable || false;
				} catch (error) {
					console.error(
						`Error checking public address ${port.publicHost}:`,
						error,
					);
					results.publicReachable = false;
				}
			}

			// Check private address reachability if available
			if (port.privateHost) {
				try {
					const privateResults = await checkPorts(
						[port.number],
						port.privateHost,
					);
					results.privateReachable = privateResults[0]?.reachable || false;
				} catch (error) {
					console.error(
						`Error checking private address ${port.privateHost}:`,
						error,
					);
					results.privateReachable = false;
				}
			}

			return results;
		}),
	);

	return portChecks;
};
