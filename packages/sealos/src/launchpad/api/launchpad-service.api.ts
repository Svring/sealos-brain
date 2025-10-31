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
import {
	errAsync,
	fromPromise,
	type ResultAsync,
} from "neverthrow";
import { LAUNCHPAD_LABELS } from "../constants/launchpad-labels.constant";
import { getLaunchpad } from "./launchpad.api";

// ============================================================================
// Launchpad Service Functions (Higher-level business logic)
// ============================================================================

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
): Promise<ResultAsync<K8sResource[], Error>> => {
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
		const [mainResourcesResult, podResourcesResult] = await Promise.all([
			fromPromise(selectResources(context, mainTargets), (error) => error as Error),
			fromPromise(selectResources(context, podTargets), (error) => error as Error),
		]);

		if (mainResourcesResult.isErr()) {
			return errAsync(mainResourcesResult.error);
		}
		if (podResourcesResult.isErr()) {
			return errAsync(podResourcesResult.error);
		}

		// Merge and return both results
		return fromPromise(
			Promise.resolve([...mainResourcesResult.value, ...podResourcesResult.value]),
			(error) => error as Error,
		);
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

		return fromPromise(selectResources(context, targets), (error) => error as Error);
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
): Promise<
	ResultAsync<
		Array<{
			port: unknown;
			publicReachable?: boolean;
			privateReachable?: boolean;
		}>,
		Error
	>
> => {
	// Get the launchpad object first
	const launchpadResult = await getLaunchpad(context, {
		path: { name: target.name },
	});
	if (launchpadResult.isErr()) {
		return errAsync(launchpadResult.error);
	}

	const launchpad = launchpadResult.value;

	// Extract ports from the launchpad object
	const ports = (launchpad as { ports?: unknown[] })?.ports || [];

	// Check reachability for each port
	const portChecks = await Promise.all(
		ports.map(async (port: { publicHost?: string; privateHost?: string; number: number; publicAddress?: string; privateAddress?: string }) => {
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

	return fromPromise(Promise.resolve(portChecks), (error) => error as Error);
};
