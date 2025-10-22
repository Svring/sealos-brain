import { z } from "zod";
import { DEVBOX_LABELS } from "@/constants/devbox/devbox-labels.constant";
import {
	formatDurationToReadable,
	formatIsoDateToReadable,
} from "@/lib/date/date-utils";
import { standardizeUnit } from "@/lib/k8s/k8s-client.utils";
import {
	getCurrentNamespace,
	getRegionUrlFromKubeconfig,
} from "@/lib/k8s/k8s-server.utils";
import { composePortsFromResources } from "@/lib/network/network.utils";
import type { Env, K8sResource } from "@/mvvm/k8s/models/k8s-resource.model";

export const SshSchema = z.object({
	host: z
		.any()
		.nullable()
		.describe(
			JSON.stringify({
				resourceType: "context",
				path: ["kubeconfig"],
			}),
		)
		.transform(async (kubeconfig) => {
			if (!kubeconfig) return null;
			return await getRegionUrlFromKubeconfig(kubeconfig);
		}),
	port: z.any().describe(
		JSON.stringify({
			resourceType: "devbox",
			path: ["status.network.nodePort"],
		}),
	),
	user: z.any().describe(
		JSON.stringify({
			resourceType: "devbox",
			path: ["spec.config.user"],
		}),
	),
	workingDir: z.any().describe(
		JSON.stringify({
			resourceType: "devbox",
			path: ["spec.config.workingDir"],
		}),
	),
	privateKey: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "secret",
				path: ["data.SEALOS_DEVBOX_PRIVATE_KEY"],
			}),
		)
		.transform((val) => Buffer.from(val, "base64").toString("utf-8"))
		.optional(),
});

export type Ssh = z.infer<typeof SshSchema>;

export const DevboxBridgeSchema = z.object({
	name: z.any().describe(
		JSON.stringify({
			resourceType: "devbox",
			path: ["metadata.name"],
		}),
	),
	uid: z.any().describe(
		JSON.stringify({
			resourceType: "devbox",
			path: ["metadata.uid"],
		}),
	),
	runtime: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "devbox",
				path: ["spec.image"],
			}),
		)
		.transform((image) => {
			// console.log("image", image);
			// Transform the image similar to how devbox node title processes it
			// First extract the image name (remove registry and tag)
			const imageName = image.split(":")[0].split("/").pop() || "";
			// Then apply the same processing as devbox node title: split by "-", remove last part, join back
			return imageName.split("-").slice(0, 1).join("-");
		}),
	image: z.any().describe(
		JSON.stringify({
			resourceType: "devbox",
			path: ["spec.image"],
		}),
	),
	operationalStatus: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "devbox",
				path: [""],
			}),
		)
		.transform((resource) => {
			const metadata = resource.metadata;
			const status = resource.status;

			// Get createdAt from metadata and format it
			const createdAt = formatIsoDateToReadable(metadata.creationTimestamp);

			// Calculate upTime from state.running.startedAt
			let upTime: string | undefined;
			if (status?.state?.running?.startedAt) {
				const startedAt = new Date(status.state.running.startedAt);
				const currentTime = new Date();
				const upTimeSeconds = Math.floor(
					(currentTime.getTime() - startedAt.getTime()) / 1000,
				); // Convert to seconds
				upTime = formatDurationToReadable(upTimeSeconds);
			}

			return {
				createdAt,
				upTime,
			};
		}),
	status: z.any().describe(
		JSON.stringify({
			resourceType: "devbox",
			path: ["status.phase"],
		}),
	),
	resource: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "devbox",
				path: ["spec.resource"],
			}),
		)
		.transform((resources) => {
			// Convert Kubernetes resource strings to universal units
			const cpu = standardizeUnit(resources.cpu || "0", "cpu");
			const memory = standardizeUnit(resources.memory || "0", "memory");

			return {
				cpu,
				memory,
			};
		}),
	ssh: SshSchema,
	env: z
		.any()
		.optional()
		.describe(
			JSON.stringify({
				resourceType: "devbox",
				path: ["spec.config.env"],
			}),
		)
		.transform((envVars: Env[]) => {
			if (!envVars.length) {
				return [];
			}
			return envVars.map((envVar: Env) => {
				if (envVar.value) {
					// Direct value environment variable
					return {
						name: envVar.name,
						value: envVar.value,
					};
				} else if (envVar.valueFrom?.secretKeyRef) {
					// Secret reference environment variable
					return {
						name: envVar.name,
						valueFrom: {
							secretKeyRef: {
								name: envVar.valueFrom.secretKeyRef.name,
								key: envVar.valueFrom.secretKeyRef.key,
							},
						},
					};
				} else {
					// Unknown type, return as value with placeholder
					return {
						name: envVar.name,
						value: `[UNKNOWN_ENV_TYPE: ${JSON.stringify(envVar)}]`,
					};
				}
			});
		}),
	ports: z
		.any()
		.optional()
		.describe(
			JSON.stringify([
				{
					resourceType: "service",
					label: DEVBOX_LABELS.DEVBOX_MANAGER,
				},
				{
					resourceType: "ingress",
					label: DEVBOX_LABELS.DEVBOX_MANAGER,
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
			return await composePortsFromResources(services, ingresses, namespace, regionUrl);
		}),
	pods: z
		.any()
		.optional()
		.describe(
			JSON.stringify({
				resourceType: "pod",
				label: DEVBOX_LABELS.APP_KUBERNETES_NAME,
			}),
		)
		.transform((pods) => {
			return pods.map((pod: K8sResource) => {
				return {
					name: pod.metadata?.name,
					status: pod.status?.phase,
				};
			});
		}),
});

export type DevboxObjectQuery = z.infer<typeof DevboxBridgeSchema>;
