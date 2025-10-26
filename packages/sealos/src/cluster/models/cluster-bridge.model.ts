import { parseFieldDescriptions } from "@sealos-brain/bridge/utils";
import { z } from "zod";

export const ClusterBridgeMetaSchema = z.object({
	name: z.any().meta({
		resources: {
			resourceType: "cluster",
			path: ["metadata.name"],
		},
	}),
	uid: z.any().meta({
		resources: {
			resourceType: "cluster",
			path: ["metadata.uid"],
		},
	}),
	type: z.any().meta({
		resources: {
			resourceType: "cluster",
			path: ["spec.clusterDefinitionRef"],
		},
	}),
	version: z.any().meta({
		resources: {
			resourceType: "cluster",
			path: ["spec.clusterVersionRef"],
		},
	}),
	status: z
		.any()
		.nullable()
		.meta({
			resources: {
				resourceType: "cluster",
				path: ["status.phase"],
			},
		}),
	resource: z.any().meta({
		resources: {
			resourceType: "cluster",
			path: ["spec.componentSpecs"],
		},
	}),
	operationalStatus: z.any().meta({
		resources: {
			resourceType: "cluster",
			path: [""],
		},
	}),
	components: z.any().meta({
		resources: {
			resourceType: "cluster",
			path: [""],
		},
	}),
	connection: z.any().meta({
		resources: [
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
		],
	}),
	backup: z.any().meta({
		resources: {
			resourceType: "cluster",
			path: ["spec.backup"],
		},
	}),
	pods: z
		.any()
		.meta({
			resources: {
				resourceType: "pod",
				label: "app.kubernetes.io/instance",
			},
		})
		.optional(),
});

export type ClusterBridgeMeta = z.infer<typeof ClusterBridgeMetaSchema>;

console.log(parseFieldDescriptions(ClusterBridgeMetaSchema));
