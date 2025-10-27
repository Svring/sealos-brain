"use server";

import https from "node:https";
import { composeObjectFromTarget } from "@sealos-brain/bridge/api";
import type {
	BuiltinResourceTarget,
	K8sContext,
} from "@sealos-brain/k8s/shared/models";
import { getRegionUrlFromKubeconfig } from "@sealos-brain/k8s/shared/utils";
import axios from "axios";
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
async function createLaunchpadAxios(context: K8sContext, apiVersion?: string) {
	const regionUrl = await getRegionUrlFromKubeconfig(context.kubeconfig);
	if (!regionUrl) {
		throw new Error("Failed to extract region URL from kubeconfig");
	}

	const serviceSubdomain = "applaunchpad";
	const baseURL = `http://${serviceSubdomain}.${regionUrl}/api${
		apiVersion ? `/${apiVersion}` : ""
	}`;

	const isDevelopment = process.env.MODE === "development";
	const httpsAgent = new https.Agent({
		keepAlive: true,
		rejectUnauthorized: !isDevelopment,
	});

	return axios.create({
		baseURL,
		headers: {
			"Content-Type": "application/json",
			Authorization: encodeURIComponent(context.kubeconfig),
		},
		httpsAgent,
	});
}

// ============================================================================
// Query Operations
// ============================================================================

/**
 * Get launchpad by BuiltinResourceTarget
 */
export const getLaunchpad = async (
	context: K8sContext,
	target: BuiltinResourceTarget,
) => {
	// Choose the appropriate schema based on resource type
	const bridgeSchema =
		target.resourceType === "deployment"
			? DeploymentBridgeMetaSchema
			: target.resourceType === "statefulset"
				? StatefulsetBridgeMetaSchema
				: DeploymentBridgeMetaSchema; // Default to deployment

	const transformSchema =
		target.resourceType === "deployment"
			? DeploymentBridgeTransSchema
			: target.resourceType === "statefulset"
				? StatefulsetBridgeTransSchema
				: DeploymentBridgeTransSchema;

	const objectSchema =
		target.resourceType === "deployment"
			? DeploymentObjectSchema
			: target.resourceType === "statefulset"
				? StatefulsetObjectSchema
				: DeploymentObjectSchema;

	const launchpadObject = await composeObjectFromTarget(
		context,
		target,
		bridgeSchema,
		transformSchema,
		objectSchema,
	);

	return LaunchpadObjectSchema.parse(launchpadObject);
};

/**
 * Get application details by name
 */
export const getLaunchpadByName = async (
	context: K8sContext,
	params: { path: { name: string } },
) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.get(`/app/${params.path.name}`);
	return response.data.data;
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
) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.post("/app", params.body);
	return response.data;
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
) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.patch(`/app/${params.path.name}`, params.body);
	return response.data;
};

/**
 * Delete launchpad application
 */
export const deleteLaunchpad = async (
	context: K8sContext,
	params: { path: { name: string } },
) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.delete(`/app/${params.path.name}`);
	return response.data;
};

/**
 * Start launchpad application
 */
export const startLaunchpad = async (
	context: K8sContext,
	params: { path: { name: string } },
) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.post(`/app/${params.path.name}/start`, {});
	return response.data;
};

/**
 * Pause launchpad application
 */
export const pauseLaunchpad = async (
	context: K8sContext,
	params: { path: { name: string } },
) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.post(`/app/${params.path.name}/pause`, {});
	return response.data;
};

/**
 * Restart launchpad application
 */
export const restartLaunchpad = async (
	context: K8sContext,
	params: { path: { name: string } },
) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.post(`/app/${params.path.name}/restart`, {});
	return response.data;
};
