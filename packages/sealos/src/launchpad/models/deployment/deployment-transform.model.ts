import {
	getCurrentNamespace,
	getRegionUrlFromKubeconfig,
} from "@sealos-brain/k8s/shared/utils";
import { composePortsFromResources } from "@sealos-brain/shared/network/utils";
import { z } from "zod";
import {
	determineLaunchpadStatus,
	transformConfigMap,
	transformDeploymentEnv,
	transformDeploymentResource,
	transformImage,
	transformLaunchCommand,
	transformOperationalStatus,
	transformPods,
	transformStrategy,
} from "#launchpad/utils/launchpad.utils";

// biome-ignore lint/suspicious/noExplicitAny: Generic resource transformation
const transformResourceType = (resource: any) => resource.kind.toLowerCase();

// biome-ignore lint/suspicious/noExplicitAny: Generic resource transformation
const transformStatus = (resource: any) => {
	if (!resource) return "Unknown";

	const status = resource.status || {};
	const paused =
		resource.metadata?.annotations?.["deploy.cloud.sealos.io/pause"];
	const statusObject = {
		replicas: status.replicas || 0,
		readyReplicas: status.readyReplicas || 0,
		unavailableReplicas: status.unavailableReplicas || 0,
		availableReplicas: status.availableReplicas || 0,
		paused,
	};

	return determineLaunchpadStatus(statusObject);
};

// biome-ignore lint/suspicious/noExplicitAny: Generic resource transformation
const transformPorts = async (resources: any) => {
	if (!resources || !Array.isArray(resources) || resources.length < 3) {
		return [];
	}

	const [services, ingresses, kubeconfig] = resources;

	// Extract namespace and regionUrl from context
	const namespace = await getCurrentNamespace(kubeconfig);
	const regionUrl = await getRegionUrlFromKubeconfig(kubeconfig);

	// Compose ports using the modular function
	if (!namespace || !regionUrl) {
		return [];
	}
	return await composePortsFromResources(
		services,
		ingresses,
		namespace,
		regionUrl,
	);
};

// Transform schema
export const DeploymentBridgeTransSchema = z.object({
	name: z.any(),
	resourceType: z.any().transform(transformResourceType),
	uid: z.any(),
	image: z.any().transform(transformImage),
	resource: z.any().transform(transformDeploymentResource),
	strategy: z.any().transform(transformStrategy),
	status: z.any().transform(transformStatus),
	operationalStatus: z.any().transform(transformOperationalStatus),
	env: z.any().transform(transformDeploymentEnv).optional(),
	ports: z.any().optional().transform(transformPorts),
	launchCommand: z.any().transform(transformLaunchCommand),
	configMap: z.any().transform(transformConfigMap).optional(),
	pods: z.any().optional().transform(transformPods),
});
