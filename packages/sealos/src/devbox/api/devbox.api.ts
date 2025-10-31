"use server";

import type { K8sContext } from "@sealos-brain/k8s/shared/models";
import { getRegionUrlFromKubeconfig } from "@sealos-brain/k8s/shared/utils";
import { createAxiosClient } from "@sealos-brain/shared/network/utils";
import type { AxiosInstance } from "axios";
import {
	err,
	errAsync,
	fromPromise,
	ok,
	type Result,
	type ResultAsync,
} from "neverthrow";
import type { DevboxCreate } from "../models/devbox-create.model";
import type { DevboxUpdate } from "../models/devbox-update.model";

/**
 * Creates axios instance for devbox API calls
 */
async function createDevboxAxios(
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

	const baseURL = `http://devbox.${regionUrl}/api/v1/devbox`;

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
 * List all devboxes
 */
export const listDevboxes = async (
	context: K8sContext,
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createDevboxAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(api.get("/"), (error) => error as Error).map(
		(response) => response.data.data,
	);
};

/**
 * Get devbox details
 */
export const getDevbox = async (
	context: K8sContext,
	params: { path: { name: string } },
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createDevboxAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(
		api.get(`/${params.path.name}`),
		(error) => error as Error,
	).map((response) => response.data.data);
};

/**
 * Get devbox templates
 */
export const getDevboxTemplates = async (
	context: K8sContext,
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createDevboxAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(api.get("/templates"), (error) => error as Error).map(
		(response) => response.data.data,
	);
};

/**
 * Get devbox releases
 */
export const getDevboxReleases = async (
	context: K8sContext,
	params: { path: { name: string } },
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createDevboxAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(
		api.get(`/${params.path.name}/release`),
		(error) => error as Error,
	).map((response) => response.data.data);
};

/**
 * Get deployed devbox releases
 */
export const getDevboxDeploys = async (
	context: K8sContext,
	params: { path: { name: string } },
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createDevboxAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(
		api.get(`/${params.path.name}/deploy`),
		(error) => error as Error,
	).map((response) => response.data.data);
};

/**
 * Get devbox monitor data
 */
export const getDevboxMonitorData = async (
	context: K8sContext,
	params: {
		path: { name: string };
		search?: { start?: string; end?: string; step?: string };
	},
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createDevboxAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(
		api.get(`/${params.path.name}/monitor`, {
			params: params.search,
		}),
		(error) => error as Error,
	).map((response) => response.data.data);
};

// ============================================================================
// Mutation Operations
// ============================================================================

/**
 * Create devbox
 */
export const createDevbox = async (
	context: K8sContext,
	params: { body: DevboxCreate },
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createDevboxAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(api.post("/", params.body), (error) => error as Error).map(
		(response) => response.data,
	);
};

/**
 * Update devbox
 */
export const updateDevbox = async (
	context: K8sContext,
	params: {
		path: { name: string };
		body?: Omit<DevboxUpdate, "name">;
	},
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createDevboxAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(
		api.patch(`/${params.path.name}`, params.body),
		(error) => error as Error,
	).map((response) => response.data);
};

/**
 * Delete devbox
 */
export const deleteDevbox = async (
	context: K8sContext,
	params: { path: { name: string } },
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createDevboxAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(
		api.delete(`/${params.path.name}`),
		(error) => error as Error,
	).map((response) => response.data);
};

/**
 * Start devbox
 */
export const startDevbox = async (
	context: K8sContext,
	params: { path: { name: string } },
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createDevboxAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(
		api.post(`/${params.path.name}/start`, {}),
		(error) => error as Error,
	).map((response) => response.data);
};

/**
 * Pause devbox
 */
export const pauseDevbox = async (
	context: K8sContext,
	params: { path: { name: string } },
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createDevboxAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(
		api.post(`/${params.path.name}/pause`, {}),
		(error) => error as Error,
	).map((response) => response.data);
};

/**
 * Shutdown devbox
 */
export const shutdownDevbox = async (
	context: K8sContext,
	params: { path: { name: string } },
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createDevboxAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(
		api.post(`/${params.path.name}/shutdown`, {}),
		(error) => error as Error,
	).map((response) => response.data);
};

/**
 * Restart devbox
 */
export const restartDevbox = async (
	context: K8sContext,
	params: { path: { name: string } },
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createDevboxAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(
		api.post(`/${params.path.name}/restart`, {}),
		(error) => error as Error,
	).map((response) => response.data);
};

/**
 * Configure autostart
 */
export const autostartDevbox = async (
	context: K8sContext,
	params: {
		path: { name: string };
		body?: { execCommand?: string };
	},
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createDevboxAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(
		api.post(`/${params.path.name}/autostart`, params.body),
		(error) => error as Error,
	).map((response) => response.data);
};

/**
 * Create devbox release
 */
export const releaseDevbox = async (
	context: K8sContext,
	params: {
		path: { name: string };
		body: { tag: string; releaseDes?: string };
	},
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createDevboxAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(
		api.post(`/${params.path.name}/release`, params.body),
		(error) => error as Error,
	).map((response) => response.data);
};

/**
 * Delete devbox release
 */
export const deleteDevboxRelease = async (
	context: K8sContext,
	params: { path: { name: string; tag: string } },
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createDevboxAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(
		api.delete(`/${params.path.name}/release/${params.path.tag}`),
		(error) => error as Error,
	).map((response) => response.data);
};

/**
 * Deploy devbox release
 */
export const deployDevbox = async (
	context: K8sContext,
	params: { path: { name: string; tag: string } },
): Promise<ResultAsync<unknown, Error>> => {
	const apiResult = await createDevboxAxios(context);
	if (apiResult.isErr()) {
		return errAsync(apiResult.error);
	}

	const api = apiResult.value;
	return fromPromise(
		api.post(`/${params.path.name}/release/${params.path.tag}/deploy`, {}),
		(error) => error as Error,
	).map((response) => response.data);
};
