"use server";

import https from "node:https";
import { composeObjectFromTarget } from "@sealos-brain/bridge";
import type {
	BuiltinResourceTarget,
	K8sContext,
} from "@sealos-brain/k8s/shared/models";
import { getRegionUrlFromKubeconfig } from "@sealos-brain/k8s/shared/utils";
import axios from "axios";
import { DeploymentBridgeSchema } from "../models/deployment/deployment-bridge.model";
import { DeploymentObjectSchema } from "../models/deployment/deployment-object.model";
import type { LaunchpadCreateData } from "../models/launchpad-create.model";
import { LaunchpadObjectSchema } from "../models/launchpad-object.model";
import type { LaunchpadUpdateData } from "../models/launchpad-update.model";
import { StatefulsetBridgeSchema } from "../models/statefulset/statefulset-bridge.model";
import { StatefulsetObjectSchema } from "../models/statefulset/statefulset-object.model";

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
// Launchpad API Functions
// ============================================================================

/**
 * List all launchpads
 */
export const listLaunchpads = async (_context: K8sContext) => {
	// TODO: Implement list launchpads
	throw new Error("Not implemented");
};

/**
 * Get a specific launchpad by BuiltinResourceTarget
 */
export const getLaunchpad = async (
	context: K8sContext,
	target: BuiltinResourceTarget,
) => {
	// Choose the appropriate schema based on resource type
	const bridgeSchema =
		target.resourceType === "deployment"
			? DeploymentBridgeSchema
			: target.resourceType === "statefulset"
				? StatefulsetBridgeSchema
				: DeploymentBridgeSchema; // Default to deployment

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
		objectSchema,
	);

	return LaunchpadObjectSchema.parse(launchpadObject);
};

/**
 * Get launchpad monitor data
 */
export const getLaunchpadMonitorData = async (
	context: K8sContext,
	queryKey: string,
	queryName: string,
	step: string = "2m",
) => {
	const api = await createLaunchpadAxios(context);
	const response = await api.get("/monitor/getMonitorData", {
		params: {
			queryKey,
			queryName,
			step,
		},
	});
	return response.data.data;
};

/**
 * Get launchpad logs
 */
export const getLaunchpadLogs = async (
	_context: K8sContext,
	_target: BuiltinResourceTarget,
) => {
	// TODO: Implement get launchpad logs
	throw new Error("Not implemented");
};

/**
 * Create launchpad
 */
export const createLaunchpad = async (
	context: K8sContext,
	input: LaunchpadCreateData,
) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.post("/app", input);
	return response.data;
};

/**
 * Update launchpad
 */
export const updateLaunchpad = async (
	context: K8sContext,
	input: LaunchpadUpdateData,
) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.patch(`/app/${input.name}`, input);
	return response.data;
};

/**
 * Start launchpad
 */
export const startLaunchpad = async (context: K8sContext, name: string) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.post(`/app/${name}/start`, {});
	return response.data;
};

/**
 * Pause launchpad
 */
export const pauseLaunchpad = async (context: K8sContext, name: string) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.post(`/app/${name}/pause`, {});
	return response.data;
};

/**
 * Restart launchpad
 */
export const restartLaunchpad = async (context: K8sContext, name: string) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.post(`/app/${name}/restart`, {});
	return response.data;
};

/**
 * Delete launchpad
 */
export const deleteLaunchpad = async (context: K8sContext, name: string) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.delete(`/app/${name}`);
	return response.data;
};
