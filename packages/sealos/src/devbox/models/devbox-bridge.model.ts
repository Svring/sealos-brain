import { parseFieldDescriptions } from "@sealos-brain/bridge/utils";
import { z } from "zod";
import { DEVBOX_LABELS } from "../constants/devbox-labels.constant";

export const DevboxBridgeMetaSchema = z.object({
	name: z.any().meta({
		resources: {
			resourceType: "devbox",
			path: ["metadata.name"],
		},
	}),
	uid: z.any().meta({
		resources: {
			resourceType: "devbox",
			path: ["metadata.uid"],
		},
	}),
	runtime: z.any().meta({
		resources: {
			resourceType: "devbox",
			path: ["spec.image"],
		},
	}),
	image: z.any().meta({
		resources: {
			resourceType: "devbox",
			path: ["spec.image"],
		},
	}),
	operationalStatus: z.any().meta({
		resources: {
			resourceType: "devbox",
			path: [""],
		},
	}),
	status: z.any().meta({
		resources: {
			resourceType: "devbox",
			path: ["status.phase"],
		},
	}),
	resource: z.any().meta({
		resources: {
			resourceType: "devbox",
			path: ["spec.resource"],
		},
	}),
	ssh: z.any().meta({
		resources: [
			{
				resourceType: "context",
				path: ["kubeconfig"],
			},
			{
				resourceType: "devbox",
				path: ["status.network.nodePort"],
			},
			{
				resourceType: "devbox",
				path: ["spec.config.user"],
			},
			{
				resourceType: "devbox",
				path: ["spec.config.workingDir"],
			},
			{
				resourceType: "secret",
				path: ["data.SEALOS_DEVBOX_PRIVATE_KEY"],
			},
		],
	}),
	env: z
		.any()
		.optional()
		.meta({
			resources: {
				resourceType: "devbox",
				path: ["spec.config.env"],
			},
		}),
	ports: z
		.any()
		.optional()
		.meta({
			resources: [
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
			],
		}),
	pods: z
		.any()
		.optional()
		.meta({
			resources: {
				resourceType: "pod",
				label: DEVBOX_LABELS.APP_KUBERNETES_NAME,
			},
		}),
});

export type DevboxBridgeMeta = z.infer<typeof DevboxBridgeMetaSchema>;

console.log(parseFieldDescriptions(DevboxBridgeMetaSchema));
