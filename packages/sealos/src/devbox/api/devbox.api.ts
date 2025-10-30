"use server";

import type { K8sContext } from "@sealos-brain/k8s/shared/models";
import { getRegionUrlFromKubeconfig } from "@sealos-brain/k8s/shared/utils";
import { createAxiosClient } from "@sealos-brain/shared/network/utils";
import type { DevboxCreate } from "../models/devbox-create.model";
import type { DevboxUpdate } from "../models/devbox-update.model";

/**
 * Creates axios instance for devbox API calls
 */
async function createDevboxAxios(context: K8sContext) {
	const regionUrl = await getRegionUrlFromKubeconfig(context.kubeconfig);
	if (!regionUrl) {
		throw new Error("Failed to extract region URL from kubeconfig");
	}

	const baseURL = `http://devbox.${regionUrl}/api/v1/devbox`;

	return createAxiosClient({
		baseURL,
		headers: {
			Authorization: encodeURIComponent(context.kubeconfig),
		},
	});
}

// ============================================================================
// Query Operations
// ============================================================================

/**
 * List all devboxes
 */
export const listDevboxes = async (context: K8sContext) => {
	const api = await createDevboxAxios(context);
	const response = await api.get("/");
	return response.data.data;
};

/**
 * Get devbox details
 */
export const getDevbox = async (
	context: K8sContext,
	params: { path: { name: string } },
) => {
	const api = await createDevboxAxios(context);
	const response = await api.get(`/${params.path.name}`);
	return response.data.data;
};

/**
 * Get devbox templates
 */
export const getDevboxTemplates = async (context: K8sContext) => {
	const api = await createDevboxAxios(context);
	const response = await api.get("/templates");
	return response.data.data;
};

/**
 * Get devbox releases
 */
export const getDevboxReleases = async (
	context: K8sContext,
	params: { path: { name: string } },
) => {
	const api = await createDevboxAxios(context);
	const response = await api.get(`/${params.path.name}/release`);
	return response.data.data;
};

/**
 * Get deployed devbox releases
 */
export const getDevboxDeploys = async (
	context: K8sContext,
	params: { path: { name: string } },
) => {
	const api = await createDevboxAxios(context);
	const response = await api.get(`/${params.path.name}/deploy`);
	return response.data.data;
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
) => {
	const api = await createDevboxAxios(context);
	const response = await api.get(`/${params.path.name}/monitor`, {
		params: params.search,
	});
	return response.data.data;
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
) => {
	const api = await createDevboxAxios(context);
	const response = await api.post("/", params.body);
	return response.data;
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
) => {
	const api = await createDevboxAxios(context);
	const response = await api.patch(`/${params.path.name}`, params.body);
	return response.data;
};

/**
 * Delete devbox
 */
export const deleteDevbox = async (
	context: K8sContext,
	params: { path: { name: string } },
) => {
	const api = await createDevboxAxios(context);
	const response = await api.delete(`/${params.path.name}`);
	return response.data;
};

/**
 * Start devbox
 */
export const startDevbox = async (
	context: K8sContext,
	params: { path: { name: string } },
) => {
	const api = await createDevboxAxios(context);
	const response = await api.post(`/${params.path.name}/start`, {});
	return response.data;
};

/**
 * Pause devbox
 */
export const pauseDevbox = async (
	context: K8sContext,
	params: { path: { name: string } },
) => {
	const api = await createDevboxAxios(context);
	const response = await api.post(`/${params.path.name}/pause`, {});
	return response.data;
};

/**
 * Shutdown devbox
 */
export const shutdownDevbox = async (
	context: K8sContext,
	params: { path: { name: string } },
) => {
	const api = await createDevboxAxios(context);
	const response = await api.post(`/${params.path.name}/shutdown`, {});
	return response.data;
};

/**
 * Restart devbox
 */
export const restartDevbox = async (
	context: K8sContext,
	params: { path: { name: string } },
) => {
	const api = await createDevboxAxios(context);
	const response = await api.post(`/${params.path.name}/restart`, {});
	return response.data;
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
) => {
	const api = await createDevboxAxios(context);
	const response = await api.post(
		`/${params.path.name}/autostart`,
		params.body,
	);
	return response.data;
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
) => {
	const api = await createDevboxAxios(context);
	const response = await api.post(`/${params.path.name}/release`, params.body);
	return response.data;
};

/**
 * Delete devbox release
 */
export const deleteDevboxRelease = async (
	context: K8sContext,
	params: { path: { name: string; tag: string } },
) => {
	const api = await createDevboxAxios(context);
	const response = await api.delete(
		`/${params.path.name}/release/${params.path.tag}`,
	);
	return response.data;
};

/**
 * Deploy devbox release
 */
export const deployDevbox = async (
	context: K8sContext,
	params: { path: { name: string; tag: string } },
) => {
	const api = await createDevboxAxios(context);
	const response = await api.post(
		`/${params.path.name}/release/${params.path.tag}/deploy`,
		{},
	);
	return response.data;
};
