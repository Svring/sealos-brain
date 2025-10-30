import {
	getResource,
	listResources,
	patchBuiltinResourceMetadata,
	patchCustomResourceMetadata,
	removeBuiltinResourceMetadata,
	removeCustomResourceMetadata,
	selectResources,
	upsertCustomResource,
} from "@sealos-brain/k8s/shared/api";
import type {
	BuiltinResourceTarget,
	CustomResourceTarget,
	CustomResourceTypeTarget,
	K8sContext,
	K8sItem,
	ResourceTarget,
} from "@sealos-brain/k8s/shared/models";
import { getRegionUrlFromKubeconfig } from "@sealos-brain/k8s/shared/utils";
import { createAxiosClient } from "@sealos-brain/shared/network/utils";
import _ from "lodash";
import { deleteDevbox } from "#devbox/api";
import {
	INSTANCE_ANNOTATIONS,
	INSTANCE_FILTER_URLS,
	INSTANCE_LABELS,
} from "#instance/constants";
import type { InstanceObject } from "#instance/models/instance-object.model";
import { InstanceResourceSchema } from "#instance/models/instance-resource.model";
import { instanceParser } from "#instance/utils";

/**
 * Creates axios instance for instance API calls
 */
async function createInstanceAxios(context: K8sContext) {
	const regionUrl = await getRegionUrlFromKubeconfig(context.kubeconfig);
	if (!regionUrl) {
		throw new Error("Failed to extract region URL from kubeconfig");
	}

	const baseURL = `${process.env.MODE === "development" ? "http" : "https"}://template.${regionUrl}/api/v1/instance`;

	return createAxiosClient({
		baseURL,
		headers: {
			Authorization: encodeURIComponent(context.kubeconfig),
		},
	});
}

// ============================================================================
// Instance API Functions
// ============================================================================

/**
 * List all instances
 */
export const listInstances = async (context: K8sContext) => {
	const instanceTarget: CustomResourceTypeTarget = {
		type: "custom",
		resourceType: "instance",
	};
	const instanceList = await listResources(context, instanceTarget);

	// Convert raw K8s resources to instance objects using parser
	if (instanceList.items && instanceList.items.length > 0) {
		const validatedInstances = _.filter(
			instanceList.items,
			(instance) => !INSTANCE_FILTER_URLS.includes(instance?.spec?.url),
		).map((rawInstance: unknown) => {
			// Validate and parse the instance using our schema
			return InstanceResourceSchema.parse(rawInstance);
		});

		// Convert to instance objects using parser
		return instanceParser.toObjects(validatedInstances);
	}

	return [];
};

/**
 * Get a specific instance by name
 */
export const getInstance = async (
	context: K8sContext,
	name: string,
): Promise<InstanceObject> => {
	const target: CustomResourceTarget = {
		type: "custom",
		resourceType: "instance",
		name,
	};
	const instanceResource = await getResource(context, target);

	const validatedInstance = InstanceResourceSchema.parse(instanceResource);

	return instanceParser.toObject(validatedInstance);
};

/**
 * Get instance resources (related resources with instance label)
 */
export const getInstanceResources = async (
	context: K8sContext,
	name: string,
): Promise<K8sItem[]> => {
	const targets = [
		{
			type: "builtin" as const,
			resourceType: "deployment" as const,
			name,
			label: INSTANCE_LABELS.DEPLOY_ON_SEALOS,
		},
		{
			type: "builtin" as const,
			resourceType: "statefulset" as const,
			name,
			label: INSTANCE_LABELS.DEPLOY_ON_SEALOS,
		},
		{
			type: "custom" as const,
			resourceType: "devbox" as const,
			name,
			label: INSTANCE_LABELS.DEPLOY_ON_SEALOS,
		},
		{
			type: "custom" as const,
			resourceType: "cluster" as const,
			name,
			label: INSTANCE_LABELS.DEPLOY_ON_SEALOS,
		},
		{
			type: "custom" as const,
			resourceType: "objectstoragebucket" as const,
			name,
			label: INSTANCE_LABELS.DEPLOY_ON_SEALOS,
		},
	];

	const selectedResources = await selectResources(context, targets);

	return selectedResources.map((resource) => ({
		name: resource.metadata?.name || "unknown",
		uid: resource.metadata?.uid || "",
		resourceType: resource.kind?.toLowerCase() || "unknown",
	}));
};

/**
 * Delete instance
 */
export const deleteInstance = async (
	context: K8sContext,
	params: { path: { name: string } },
) => {
	const api = await createInstanceAxios(context);

	const instanceResource = await getInstanceResources(
		context,
		params.path.name,
	);
	for (const resource of instanceResource) {
		if (resource.resourceType === "devbox") {
			await deleteDevbox(context, { path: { name: resource.name } });
		}
	}

	const response = await api.delete(`/${params.path.name}`, {});
	return response.data;
};

/**
 * Add resources to instance
 */
export const addResourcesToInstance = async (
	context: K8sContext,
	name: string,
	resources: ResourceTarget[],
): Promise<{ success: boolean }> => {
	for (const resource of resources) {
		if (resource.type === "custom") {
			await patchCustomResourceMetadata(
				context,
				resource,
				"labels",
				INSTANCE_LABELS.DEPLOY_ON_SEALOS,
				name,
			);
		} else {
			await patchBuiltinResourceMetadata(
				context,
				resource,
				"labels",
				INSTANCE_LABELS.DEPLOY_ON_SEALOS,
				name,
			);
		}
	}

	return { success: true };
};

/**
 * Remove resources from instance
 */
export const removeResourcesFromInstance = async (
	context: K8sContext,
	resources: ResourceTarget[],
): Promise<{ success: boolean }> => {
	// Remove instance label from all resources
	for (const resource of resources) {
		if (resource.type === "custom") {
			await removeCustomResourceMetadata(
				context,
				resource,
				"labels",
				INSTANCE_LABELS.DEPLOY_ON_SEALOS,
			);
		} else {
			// Type assertion for builtin resources
			const builtinResource = resource as BuiltinResourceTarget;
			await removeBuiltinResourceMetadata(
				context,
				builtinResource,
				"labels",
				INSTANCE_LABELS.DEPLOY_ON_SEALOS,
			);
		}
	}

	return { success: true };
};

/**
 * Update instance display name
 */
export const updateInstanceName = async (
	context: K8sContext,
	input: { name: string; displayName: string },
): Promise<{
	name: string;
	newDisplayName: string;
}> => {
	const target = {
		type: "custom" as const,
		resourceType: "instance" as const,
		name: input.name,
	};

	await patchCustomResourceMetadata(
		context,
		target,
		"annotations",
		INSTANCE_ANNOTATIONS.DISPLAY_NAME,
		input.displayName,
	);

	return {
		name: input.name,
		newDisplayName: input.displayName,
	};
};

/**
 * Create a new instance
 */
export const createInstance = async (
	context: K8sContext,
	input: { name: string },
): Promise<InstanceObject> => {
	const target = {
		type: "custom" as const,
		resourceType: "instance" as const,
		name: input.name,
	};

	const resourceBody = {
		apiVersion: "app.sealos.io/v1",
		kind: "Instance",
		metadata: {
			name: input.name,
			labels: {
				[INSTANCE_LABELS.DEPLOY_ON_SEALOS]: input.name,
			},
		},
		spec: {
			templateType: "inline",
			defaults: {
				app_name: {
					type: "string",
					value: input.name,
				},
			},
			title: input.name,
		},
	};

	const instanceResource = await upsertCustomResource(
		context,
		target,
		resourceBody,
	);

	return instanceParser.toObject(instanceResource);
};
