import { parseFieldDescriptions } from "@sealos-brain/bridge/utils";
import { z } from "zod";
import { LAUNCHPAD_LABELS } from "../../constants/launchpad-labels.constant";

// StatefulSet bridge meta schema
export const StatefulsetBridgeMetaSchema = z.object({
	name: z.any().meta({
		resources: {
			resourceType: "statefulset",
			path: ["metadata.name"],
		},
	}),
	resourceType: z.any().meta({
		resources: {
			resourceType: "statefulset",
			path: [""],
		},
	}),
	uid: z.any().meta({
		resources: {
			resourceType: "statefulset",
			path: ["metadata.uid"],
		},
	}),
	image: z.any().meta({
		resources: [
			{
				resourceType: "statefulset",
				path: ["spec.template.spec.containers"],
			},
			{
				resourceType: "secret",
				path: ["data"],
			},
		],
	}),
	resource: z.any().meta({
		resources: {
			resourceType: "statefulset",
			path: ["spec"],
		},
	}),
	status: z.any().meta({
		resources: {
			resourceType: "statefulset",
			path: [""],
		},
	}),
	strategy: z.any().meta({
		resources: {
			resourceType: "hpa",
			path: ["spec"],
		},
	}),
	operationalStatus: z.any().meta({
		resources: {
			resourceType: "statefulset",
			path: [""],
		},
	}),
	env: z
		.any()
		.meta({
			resources: {
				resourceType: "statefulset",
				path: ["spec.template.spec.containers"],
			},
		})
		.optional(),
	ports: z
		.any()
		.optional()
		.meta({
			resources: [
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
			],
		}),
	launchCommand: z.any().meta({
		resources: {
			resourceType: "statefulset",
			path: ["spec.template.spec.containers"],
		},
	}),
	configMap: z
		.any()
		.meta({
			resources: [
				{
					resourceType: "statefulset",
					path: ["spec.template.spec.containers"],
				},
				{
					resourceType: "configmap",
				},
			],
		})
		.optional(),
	localStorage: z
		.any()
		.meta({
			resources: {
				resourceType: "pvc",
				label: "app",
			},
		})
		.optional(),
	pods: z
		.any()
		.optional()
		.meta({
			resources: {
				resourceType: "pod",
				label: "app",
			},
		}),
});

export type StatefulsetBridgeMeta = z.infer<typeof StatefulsetBridgeMetaSchema>;

console.log(parseFieldDescriptions(StatefulsetBridgeMetaSchema));
