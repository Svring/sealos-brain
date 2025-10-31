"use server";

import { composeObjectFromTarget } from "@sealos-brain/bridge/api";
import type {
	BuiltinResourceTarget,
	K8sContext,
} from "@sealos-brain/k8s/shared/models";
import { getRegionUrlFromKubeconfig } from "@sealos-brain/k8s/shared/utils";
import { createAxiosClient } from "@sealos-brain/shared/network/utils";
import type { AxiosInstance } from "axios";
import {
	err,
	fromPromise,
	ok,
	type Result,
} from "neverthrow";
import {
	DeploymentBridgeMetaSchema,
	DeploymentBridgeTransSchema,
	StatefulsetBridgeMetaSchema,
	StatefulsetBridgeTransSchema,
} from "../models";
import type { LaunchpadCreate } from "../models/launchpad-create.model";
import {
	DeploymentObjectSchema,
	LaunchpadObjectSchema,
	StatefulsetObjectSchema,
} from "../models/launchpad-object.model";
import type { LaunchpadUpdate } from "../models/launchpad-update.model";

/**
 * Creates axios instance for launchpad API calls
 */
async function createLaunchpadAxios(
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

	const baseURL = `http://applaunchpad.${regionUrl}/api/v1`;

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
// Query Operations
// ============================================================================

/**
 * Get application details by name
 */
export const getLaunchpad = async (
	context: K8sContext,
	params: { path: { name: string } },
): Promise<unknown> => {
	const apiResult = await createLaunchpadAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.get(`/app/${params.path.name}`),
		(error) => error as Error,
	).map((response) => response.data.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};

// ============================================================================
// Mutation Operations
// ============================================================================

/**
 * Create launchpad application
 */
export const createLaunchpad = async (
	context: K8sContext,
	params: { body: LaunchpadCreate },
): Promise<unknown> => {
	const apiResult = await createLaunchpadAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(api.post("/app", params.body), (error) => error as Error).map(
		(response) => response.data,
	);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};

/**
 * Update launchpad application
 */
export const updateLaunchpad = async (
	context: K8sContext,
	params: {
		path: { name: string };
		body?: Omit<LaunchpadUpdate, "name">;
	},
): Promise<unknown> => {
	const apiResult = await createLaunchpadAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.patch(`/app/${params.path.name}`, params.body),
		(error) => error as Error,
	).map((response) => response.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};

/**
 * Delete launchpad application
 */
export const deleteLaunchpad = async (
	context: K8sContext,
	params: { path: { name: string } },
): Promise<unknown> => {
	const apiResult = await createLaunchpadAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.delete(`/app/${params.path.name}`),
		(error) => error as Error,
	).map((response) => response.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};

/**
 * Start launchpad application
 */
export const startLaunchpad = async (
	context: K8sContext,
	params: { path: { name: string } },
): Promise<unknown> => {
	const apiResult = await createLaunchpadAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.post(`/app/${params.path.name}/start`, {}),
		(error) => error as Error,
	).map((response) => response.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};

/**
 * Pause launchpad application
 */
export const pauseLaunchpad = async (
	context: K8sContext,
	params: { path: { name: string } },
): Promise<unknown> => {
	const apiResult = await createLaunchpadAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.post(`/app/${params.path.name}/pause`, {}),
		(error) => error as Error,
	).map((response) => response.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};

/**
 * Restart launchpad application
 */
export const restartLaunchpad = async (
	context: K8sContext,
	params: { path: { name: string } },
): Promise<unknown> => {
	const apiResult = await createLaunchpadAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.post(`/app/${params.path.name}/restart`, {}),
		(error) => error as Error,
	).map((response) => response.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};
