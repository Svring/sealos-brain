"use server";

import { DEVBOX_LABELS } from "@/constants/devbox/devbox-labels.constant";
import { BUILTIN_RESOURCES } from "@/constants/k8s/k8s-builtin.constant";
import { CUSTOM_RESOURCES } from "@/constants/k8s/k8s-custom.constant";
import { selectResources } from "@/lib/k8s/k8s-service.api";
import { checkPorts } from "@/lib/network/network.api";
import { resourceParser } from "@/lib/resource/resource.parser";
import { transformMonitorData } from "@/lib/resource/resource.utils";
import type { ResourceTypeTarget } from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s-custom.model";
import type {
	K8sItem,
	K8sResource,
} from "@/mvvm/k8s/models/k8s-resource.model";
import type { MonitorData } from "@/mvvm/resource/models/resource-monitor.model";
import { getDevbox, getDevboxMonitorData } from "./devbox.api";

// ============================================================================
// DevBox Service Functions (Higher-level business logic)
// ============================================================================

/**
 * Get devbox combined monitor
 */
export const getDevboxMonitor = async (
	context: K8sContext,
	target: CustomResourceTarget,
) => {
	const [cpuResult, memoryResult] = await Promise.allSettled([
		getDevboxMonitorData(context, "average_cpu", target.name),
		getDevboxMonitorData(context, "average_memory", target.name),
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
 * Get devbox related resources based on the devbox relevance logic
 * @param context - K8s context
 * @param target - Devbox target
 * @param resources - Array of resource types to fetch (both builtin and custom)
 * @returns Array of K8sResource objects
 */
export const getDevboxResources = async (
	context: K8sContext,
	target: CustomResourceTarget,
	resources: string[] = [
		"ingress",
		"service",
		"secret",
		"pod",
		"issuers",
		"certificates",
	],
): Promise<K8sResource[]> => {
	const devboxName = target.name;

	// Resources that use APP_KUBERNETES_NAME label
	const appKubernetesNameResources = ["secret", "pod"];

	// Type guards
	const isBuiltinResource = (
		resource: string,
	): resource is keyof typeof BUILTIN_RESOURCES =>
		resource in BUILTIN_RESOURCES;

	const isCustomResource = (
		resource: string,
	): resource is keyof typeof CUSTOM_RESOURCES => resource in CUSTOM_RESOURCES;

	// Separate resources by type and label strategy
	const devboxManagerResources = resources.filter(
		(resource) =>
			isBuiltinResource(resource) &&
			!appKubernetesNameResources.includes(resource),
	);

	const appKubernetesResources = resources.filter(
		(resource) =>
			isBuiltinResource(resource) &&
			appKubernetesNameResources.includes(resource),
	);

	const customResources = resources.filter((resource) =>
		isCustomResource(resource),
	);

	// Build targets for each label strategy
	const targets: ResourceTypeTarget[] = [];

	// DEVBOX_MANAGER label targets
	if (devboxManagerResources.length > 0 || customResources.length > 0) {
		targets.push(
			...devboxManagerResources.map((resourceType) => ({
				type: "builtin" as const,
				resourceType: resourceType,
				name: devboxName,
				label: DEVBOX_LABELS.DEVBOX_MANAGER,
			})),
			...customResources.map((resourceType) => ({
				type: "custom" as const,
				resourceType: resourceType,
				name: devboxName,
				label: DEVBOX_LABELS.DEVBOX_MANAGER,
			})),
		);
	}

	// APP_KUBERNETES_NAME label targets
	if (appKubernetesResources.length > 0) {
		targets.push(
			...appKubernetesResources.map((resourceType) => ({
				type: "builtin" as const,
				resourceType: resourceType,
				name: devboxName,
				label: DEVBOX_LABELS.APP_KUBERNETES_NAME,
			})),
		);
	}

	return selectResources(context, targets);
};

/**
 * Get devbox network status by checking port reachability
 * @param context - K8s context
 * @param target - Devbox target
 * @returns Devbox ports with reachability status for public and private addresses
 */
export const getDevboxNetwork = async (
	context: K8sContext,
	target: CustomResourceTarget,
) => {
	// Get the devbox object first
	const devbox = await getDevbox(context, target);

	// Extract ports from the devbox object
	const ports = devbox.ports || [];

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
						`Error checking public address ${port.publicAddress}:`,
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
						`Error checking private address ${port.privateAddress}:`,
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

/**
 * Get devbox deployments
 */
export const getDevboxDeployments = async (
	context: K8sContext,
	devboxName: string,
): Promise<K8sItem[]> => {
	const targets: ResourceTypeTarget[] = [
		{
			type: "builtin",
			resourceType: "deployment",
			name: devboxName,
			label: DEVBOX_LABELS.APP_DEVBOX_ID,
		},
		{
			type: "builtin",
			resourceType: "statefulset",
			name: devboxName,
			label: DEVBOX_LABELS.APP_DEVBOX_ID,
		},
	];

	const selectedResources = await selectResources(context, targets);

	// Convert resources to items using resourceParser
	return resourceParser.toItems(selectedResources);
};
