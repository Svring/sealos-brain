import type { K8sResource } from "@sealos-brain/k8s/models";
import {
	getCurrentNamespace,
	getRegionUrlFromKubeconfig,
	standardizeUnit,
} from "@sealos-brain/k8s/utils";
import { z } from "zod";
import type {
	ClusterResource,
	ComponentSpec,
} from "@/cluster/models/cluster-resource.model";
import {
	formatDurationToReadable,
	formatIsoDateToReadable,
} from "@/lib/date/date-utils";
import { transformRegionUrl } from "@/lib/network/network.utils";

export const ClusterBridgeSchema = z.object({
	name: z.any().describe(
		JSON.stringify({
			resourceType: "cluster",
			path: ["metadata.name"],
		}),
	),
	uid: z.any().describe(
		JSON.stringify({
			resourceType: "cluster",
			path: ["metadata.uid"],
		}),
	),
	type: z.any().describe(
		JSON.stringify({
			resourceType: "cluster",
			path: ["spec.clusterDefinitionRef"],
		}),
	),
	version: z.any().describe(
		JSON.stringify({
			resourceType: "cluster",
			path: ["spec.clusterVersionRef"],
		}),
	),
	status: z
		.any()
		.nullable()
		.describe(
			JSON.stringify({
				resourceType: "cluster",
				path: ["status.phase"],
			}),
		),
	resource: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "cluster",
				path: ["spec.componentSpecs"],
			}),
		)
		.transform((data) => {
			// Convert Kubernetes resource strings to universal units
			const cpu = standardizeUnit(data.cpu || "0", "cpu");
			const memory = standardizeUnit(data.memory || "0", "memory");
			const storage = standardizeUnit(data.storage || "0", "storage");

			return {
				cpu,
				memory,
				storage,
				replicas: data.replicas || 1,
			};
		}),
	operationalStatus: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "cluster",
				path: [""],
			}),
		)
		.transform((resource) => {
			const metadata = resource.metadata;
			const createdAt = formatIsoDateToReadable(metadata.creationTimestamp);

			return {
				createdAt,
			};
		}),
	components: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "cluster",
				path: [""],
			}),
		)
		.transform((resource: ClusterResource) => {
			const componentSpecs = resource.spec.componentSpecs;
			const statusComponents = resource.status?.components;
			if (!Array.isArray(componentSpecs)) return [];

			return componentSpecs.map((spec: ComponentSpec) => {
				const cpu = standardizeUnit(
					spec.resources?.limits?.cpu || spec.resources?.requests?.cpu || "0",
					"cpu",
				);
				const memory = standardizeUnit(
					spec.resources?.limits?.memory ||
						spec.resources?.requests?.memory ||
						"0",
					"memory",
				);
				const storage = standardizeUnit(
					spec.volumeClaimTemplates?.[0]?.spec?.resources?.requests?.storage ||
						"0",
					"storage",
				);

				return {
					name: spec.name,
					status: statusComponents?.[spec.name]?.phase || "unknown",
					resource: {
						cpu,
						memory,
						storage,
						replicas: spec.replicas || 0,
					},
				};
			});
		}),
	connection: z
		.any()
		.describe(
			JSON.stringify([
				{
					resourceType: "secret",
					label: "app.kubernetes.io/instance",
					name: "{{instanceName}}-conn-credential$",
					path: ["data"],
				},
				{
					resourceType: "service",
					label: "app.kubernetes.io/instance",
					name: "^{{instanceName}}-export$",
				},
				{
					resourceType: "cluster",
					path: ["spec.clusterDefinitionRef"],
				},
				{
					resourceType: "context",
					path: ["kubeconfig"],
				},
			]),
		)
		.transform(async (resources) => {
			if (!resources || !Array.isArray(resources) || resources.length < 4) {
				return {
					privateConnection: {},
					publicConnection: null,
				};
			}

			const [secretData, exportService, clusterType, kubeconfig] = resources;

			// Decode secret data
			const endpoint = secretData?.endpoint
				? Buffer.from(secretData.endpoint, "base64").toString("utf-8")
				: null;
			const host = secretData?.host
				? Buffer.from(secretData.host, "base64").toString("utf-8")
				: null;
			const port = secretData?.port
				? Buffer.from(secretData.port, "base64").toString("utf-8")
				: null;
			const username = secretData?.username
				? Buffer.from(secretData.username, "base64").toString("utf-8")
				: null;
			const password = secretData?.password
				? Buffer.from(secretData.password, "base64").toString("utf-8")
				: null;

			// Get namespace for private connection
			const namespace = await getCurrentNamespace(kubeconfig);

			// Compose private connection string
			let privateConnectionString: string | null = null;
			if (host && port && username && password && namespace && clusterType) {
				const internalUrl = `${host}.${namespace}.svc`;
				const type = clusterType.toLowerCase();

				switch (type) {
					case "postgresql":
						privateConnectionString = `postgresql://${username}:${password}@${internalUrl}:${port}`;
						break;
					case "mongodb":
						privateConnectionString = `mongodb://${username}:${password}@${internalUrl}:${port}`;
						break;
					case "redis":
						privateConnectionString = `redis://${username}:${password}@${internalUrl}:${port}`;
						break;
					case "apecloud-mysql":
						privateConnectionString = `mysql://${username}:${password}@${internalUrl}:${port}`;
						break;
					case "kafka":
						privateConnectionString = `${internalUrl}-kafka-broker:${port}`;
						break;
					case "milvus":
						privateConnectionString = `${internalUrl}-milvus:${port}`;
						break;
					default:
						privateConnectionString = `${type}://${username}:${password}@${internalUrl}:${port}`;
				}
			}

			// Compose public connection
			let publicConnection = null;
			if (exportService?.spec?.ports?.[0]?.nodePort) {
				const nodePort = exportService.spec.ports[0].nodePort;
				const regionUrl = await getRegionUrlFromKubeconfig(kubeconfig);

				let publicConnectionString: string | null = null;
				if (regionUrl && username && password && clusterType) {
					const dbconnUrl = transformRegionUrl(regionUrl).replace(
						"sealos",
						"dbconn.",
					);
					const type = clusterType.toLowerCase();

					switch (type) {
						case "postgresql":
							publicConnectionString = `postgresql://${username}:${password}@${dbconnUrl}:${nodePort}`;
							break;
						case "mongodb":
							publicConnectionString = `mongodb://${username}:${password}@${dbconnUrl}:${nodePort}`;
							break;
						case "redis":
							publicConnectionString = `redis://${username}:${password}@${dbconnUrl}:${nodePort}`;
							break;
						case "apecloud-mysql":
							publicConnectionString = `mysql://${username}:${password}@${dbconnUrl}:${nodePort}`;
							break;
						case "kafka":
							publicConnectionString = `${dbconnUrl}:${nodePort}`;
							break;
						case "milvus":
							publicConnectionString = `${dbconnUrl}:${nodePort}`;
							break;
						default:
							publicConnectionString = `${type}://${username}:${password}@${dbconnUrl}:${nodePort}`;
					}
				}

				publicConnection = {
					port: nodePort,
					connectionString: publicConnectionString,
				};
			}

			return {
				privateConnection: {
					endpoint,
					host,
					port,
					username,
					password,
					connectionString: privateConnectionString,
				},
				publicConnection,
			};
		}),
	backup: z.any().describe(
		JSON.stringify({
			resourceType: "cluster",
			path: ["spec.backup"],
		}),
	),
	pods: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "pod",
				label: "app.kubernetes.io/instance",
			}),
		)
		.transform((pods: K8sResource[]) => {
			return pods.map((pod: K8sResource) => {
				// Calculate upTime from pod startTime
				let upTime: string | undefined;
				if (pod.status?.startTime) {
					const startedAt = new Date(pod.status.startTime as string);
					const currentTime = new Date();
					const upTimeSeconds = Math.floor(
						(currentTime.getTime() - startedAt.getTime()) / 1000,
					);
					upTime = formatDurationToReadable(upTimeSeconds);
				}

				return {
					name: pod.metadata?.name,
					status: pod.status?.phase,
					upTime,
					containers: pod.status?.containerStatuses || [],
				};
			});
		})
		.optional(),
});

export type ClusterObjectQuery = z.infer<typeof ClusterBridgeSchema>;
