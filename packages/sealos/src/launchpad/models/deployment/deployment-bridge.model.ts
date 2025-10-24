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
} from "@/launchpad/utils/launchpad.utils";
import { LAUNCHPAD_LABELS } from "../../constants/launchpad-labels.constant";

// Deployment object query schema
export const DeploymentBridgeSchema = z.object({
	name: z.any().describe(
		JSON.stringify({
			resourceType: "deployment",
			path: ["metadata.name"],
		}),
	),
	resourceType: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "deployment",
				path: [""],
			}),
		)
		.transform((resource) => resource.kind.toLowerCase()),
	uid: z.any().describe(
		JSON.stringify({
			resourceType: "deployment",
			path: ["metadata.uid"],
		}),
	),
	image: z
		.any()
		.describe(
			JSON.stringify([
				{
					resourceType: "deployment",
					path: ["spec.template.spec.containers"],
				},
				{
					resourceType: "secret",
					path: ["data"],
				},
			]),
		)
		.transform(transformImage),
	resource: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "deployment",
				path: ["spec"],
			}),
		)
		.transform(transformDeploymentResource),
	strategy: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "hpa",
				path: ["spec"],
			}),
		)
		.transform(transformStrategy),
	status: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "deployment",
				path: [""],
			}),
		)
		.transform((resource) => {
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
		}),
	operationalStatus: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "deployment",
				path: [""],
			}),
		)
		.transform(transformOperationalStatus),
	env: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "deployment",
				path: ["spec.template.spec.containers"],
			}),
		)
		.transform(transformDeploymentEnv)
		.optional(),
	ports: z
		.any()
		.optional()
		.describe(
			JSON.stringify([
				{
					resourceType: "service",
					label: LAUNCHPAD_LABELS.APP_DEPLOY_MANAGER,
				},
				{
					resourceType: "ingress",
					label: LAUNCHPAD_LABELS.APP_DEPLOY_MANAGER,
				},
				{
					resourceType: "context",
					path: ["kubeconfig"],
				},
			]),
		)
		.transform(async (resources) => {
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
		}),
	launchCommand: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "deployment",
				path: ["spec.template.spec.containers"],
			}),
		)
		.transform(transformLaunchCommand),
	configMap: z
		.any()
		.describe(
			JSON.stringify([
				{
					resourceType: "deployment",
					path: ["spec.template.spec.containers"],
				},
				{
					resourceType: "configmap",
				},
			]),
		)
		.transform(transformConfigMap)
		.optional(),
	pods: z
		.any()
		.optional()
		.describe(
			JSON.stringify({
				resourceType: "pod",
				label: "app",
			}),
		)
		.transform(transformPods),
});

export type DeploymentObjectQuery = z.infer<typeof DeploymentBridgeSchema>;
