import { z } from "zod";
import { LAUNCHPAD_LABELS } from "../../constants/launchpad-labels.constant";

// Deployment bridge meta schema
export const DeploymentBridgeMetaSchema = z.object({
	name: z.any().meta({
		resources: {
			resourceType: "deployment",
			path: ["metadata.name"],
		},
	}),
	resourceType: z.any().meta({
		resources: {
			resourceType: "deployment",
			path: [""],
		},
	}),
	uid: z.any().meta({
		resources: {
			resourceType: "deployment",
			path: ["metadata.uid"],
		},
	}),
	image: z.any().meta({
		resources: [
			{
				resourceType: "deployment",
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
			resourceType: "deployment",
			path: ["spec"],
		},
	}),
	strategy: z.any().meta({
		resources: {
			resourceType: "hpa",
			path: ["spec"],
		},
	}),
	status: z.any().meta({
		resources: {
			resourceType: "deployment",
			path: [""],
		},
	}),
	operationalStatus: z.any().meta({
		resources: {
			resourceType: "deployment",
			path: [""],
		},
	}),
	env: z
		.any()
		.meta({
			resources: {
				resourceType: "deployment",
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
			resourceType: "deployment",
			path: ["spec.template.spec.containers"],
		},
	}),
	configMap: z
		.any()
		.meta({
			resources: [
				{
					resourceType: "deployment",
					path: ["spec.template.spec.containers"],
				},
				{
					resourceType: "configmap",
				},
			],
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

export type DeploymentBridgeMeta = z.infer<typeof DeploymentBridgeMetaSchema>;
