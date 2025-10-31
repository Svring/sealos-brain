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
import type { AxiosInstance } from "axios";
import _ from "lodash";
import {
	err,
	errAsync,
	fromPromise,
	ok,
	okAsync,
	type Result,
	type ResultAsync,
} from "neverthrow";
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
async function createInstanceAxios(
	context: K8sContext,
): Promise<Result<AxiosInstance, Error>> {
	const regionUrlResultAsync = fromPromise(
		getRegionUrlFromKubeconfig(context.kubeconfig),
		(error) => error as Error,
	);

	const regionUrlResult = await regionUrlResultAsync;

	if (regionUrlResult.isErr()) {
		return err(
			new Error("Failed to extract region URL from kubeconfig", {
				cause: regionUrlResult.error,
			}),
		);
	}

	const regionUrl = regionUrlResult.value;
	if (!regionUrl) {
		return err(new Error("Failed to extract region URL from kubeconfig"));
	}

	const baseURL = `${process.env.MODE === "development" ? "http" : "https"}://template.${regionUrl}/api/v1/instance`;

	return ok(
		createAxiosClient({
			baseURL,
			headers: {
				Authorization: encodeURIComponent(context.kubeconfig),
			},
		}),
	);
}

// ============================================================================
// Instance API Functions
// ============================================================================

/**
 * List all instances
 */
export const listInstances = async (
	context: K8sContext,
): Promise<ResultAsync<InstanceObject[], Error>> => {
	const instanceTarget: CustomResourceTypeTarget = {
		type: "custom",
		resourceType: "instance",
	};

	return fromPromise(
		listResources(context, instanceTarget),
		(error) => error as Error,
	).map((instanceList) => {
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
	});
};

/**
 * Get a specific instance by name
 */
export const getInstance = async (
	context: K8sContext,
	name: string,
): Promise<ResultAsync<InstanceObject, Error>> => {
	const target: CustomResourceTarget = {
		type: "custom",
		resourceType: "instance",
		name,
	};

	return fromPromise(
		getResource(context, target),
		(error) => error as Error,
	).map((instanceResource) => {
		const validatedInstance = InstanceResourceSchema.parse(instanceResource);
		return instanceParser.toObject(validatedInstance);
	});
};

/**
 * Get instance resources (related resources with instance label)
 */
export const getInstanceResources = async (
	context: K8sContext,
	name: string,
): Promise<ResultAsync<K8sItem[], Error>> => {
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

	return fromPromise(
		selectResources(context, targets),
		(error) => error as Error,
	).map((selectedResources) =>
		selectedResources.map((resource) => ({
			name: resource.metadata?.name || "unknown",
			uid: resource.metadata?.uid || "",
			resourceType: resource.kind?.toLowerCase() || "unknown",
		})),
	);
};

/**
 * Delete instance
 */
export const deleteInstance = async (
	context: K8sContext,
	params: { path: { name: string } },
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createInstanceAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const instanceResourcesResult = await getInstanceResources(
		context,
		params.path.name,
	);
	if (instanceResourcesResult.isErr()) {
		return errAsync(instanceResourcesResult.error);
	}

	const instanceResources = instanceResourcesResult.value;

	// Delete devbox resources sequentially
	for (const resource of instanceResources) {
		if (resource.resourceType === "devbox") {
			const deleteResult = await deleteDevbox(context, {
				path: { name: resource.name },
			});
			if (deleteResult.isErr()) {
				return errAsync(deleteResult.error);
			}
		}
	}

	const api = apiResult.value;
	return fromPromise(
		api.delete(`/${params.path.name}`, {}),
		(error) => error as Error,
	).map((response) => response.data);
};

/**
 * Add resources to instance
 */
export const addResourcesToInstance = async (
	context: K8sContext,
	name: string,
	resources: ResourceTarget[],
): Promise<ResultAsync<{ success: boolean }, Error>> => {
	let lastError: Error | null = null;

	for (const resource of resources) {
		if (resource.type === "custom") {
			const result = await fromPromise(
				patchCustomResourceMetadata(
					context,
					resource,
					"labels",
					INSTANCE_LABELS.DEPLOY_ON_SEALOS,
					name,
				),
				(error) => error as Error,
			);
			if (result.isErr()) {
				lastError = result.error;
				break;
			}
		} else {
			const result = await fromPromise(
				patchBuiltinResourceMetadata(
					context,
					resource,
					"labels",
					INSTANCE_LABELS.DEPLOY_ON_SEALOS,
					name,
				),
				(error) => error as Error,
			);
			if (result.isErr()) {
				lastError = result.error;
				break;
			}
		}
	}

	if (lastError) {
		return errAsync(lastError);
	}

	return okAsync({ success: true });
};

/**
 * Remove resources from instance
 */
export const removeResourcesFromInstance = async (
	context: K8sContext,
	resources: ResourceTarget[],
): Promise<ResultAsync<{ success: boolean }, Error>> => {
	let lastError: Error | null = null;

	// Remove instance label from all resources
	for (const resource of resources) {
		if (resource.type === "custom") {
			const result = await fromPromise(
				removeCustomResourceMetadata(
					context,
					resource,
					"labels",
					INSTANCE_LABELS.DEPLOY_ON_SEALOS,
				),
				(error) => error as Error,
			);
			if (result.isErr()) {
				lastError = result.error;
				break;
			}
		} else {
			// Type assertion for builtin resources
			const builtinResource = resource as BuiltinResourceTarget;
			const result = await fromPromise(
				removeBuiltinResourceMetadata(
					context,
					builtinResource,
					"labels",
					INSTANCE_LABELS.DEPLOY_ON_SEALOS,
				),
				(error) => error as Error,
			);
			if (result.isErr()) {
				lastError = result.error;
				break;
			}
		}
	}

	if (lastError) {
		return errAsync(lastError);
	}

	return okAsync({ success: true });
};

/**
 * Update instance display name
 */
export const updateInstanceName = async (
	context: K8sContext,
	input: { name: string; displayName: string },
): Promise<
	ResultAsync<
		{
			name: string;
			newDisplayName: string;
		},
		Error
	>
> => {
	const target = {
		type: "custom" as const,
		resourceType: "instance" as const,
		name: input.name,
	};

	return fromPromise(
		patchCustomResourceMetadata(
			context,
			target,
			"annotations",
			INSTANCE_ANNOTATIONS.DISPLAY_NAME,
			input.displayName,
		),
		(error) => error as Error,
	).map(() => ({
		name: input.name,
		newDisplayName: input.displayName,
	}));
};

/**
 * Create a new instance
 */
export const createInstance = async (
	context: K8sContext,
	input: { name: string },
): Promise<ResultAsync<InstanceObject, Error>> => {
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

	return fromPromise(
		upsertCustomResource(context, target, resourceBody),
		(error) => error as Error,
	).map((instanceResource) => instanceParser.toObject(instanceResource));
};
