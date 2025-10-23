"use server";

import https from "node:https";
import { composeObjectFromTarget } from "@sealos-brain/bridge";
import type {
	CustomResourceTarget,
	K8sContext,
} from "@sealos-brain/k8s/shared/models";
import { getRegionUrlFromKubeconfig } from "@sealos-brain/k8s/shared/utils";
import type {
	ClusterCreateData,
	ClusterUpdateData,
} from "@sealos-brain/sealos/cluster/models";
import {
	ClusterBridgeSchema,
	ClusterObjectSchema,
} from "@sealos-brain/sealos/cluster/models";
import axios from "axios";

/**
 * Creates axios instance for cluster API calls
 */
async function createClusterAxios(context: K8sContext, apiVersion?: string) {
	const regionUrl = await getRegionUrlFromKubeconfig(context.kubeconfig);
	if (!regionUrl) {
		throw new Error("Failed to extract region URL from kubeconfig");
	}

	const serviceSubdomain = "dbprovider";
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
// Cluster API Functions
// ============================================================================

/**
 * List all clusters
 */
export const listClusters = async (_context: K8sContext) => {
	// TODO: Implement list clusters
	throw new Error("Not implemented");
};

/**
 * Get a specific cluster by CustomResourceTarget
 */
export const getCluster = async (
	context: K8sContext,
	target: CustomResourceTarget,
) => {
	const clusterObject = await composeObjectFromTarget(
		context,
		target,
		ClusterBridgeSchema,
		ClusterObjectSchema,
	);
	return ClusterObjectSchema.parse(clusterObject);
};

/**
 * Get cluster monitor data
 */
export const getClusterMonitorData = async (
	context: K8sContext,
	dbName: string,
	dbType: string,
	queryKey: string,
) => {
	const api = await createClusterAxios(context);
	const response = await api.get("/monitor/getMonitorData", {
		params: {
			dbName,
			dbType,
			queryKey,
		},
	});
	return response.data.data;
};

/**
 * Get cluster backup list
 */
export const getClusterBackups = async (
	context: K8sContext,
	target: CustomResourceTarget,
) => {
	const api = await createClusterAxios(context);
	const response = await api.get("/backup/getBackupList", {
		params: {
			dbName: target.name,
		},
	});
	return response.data.data;
};

/**
 * Get cluster logs
 */
export const getClusterLogs = async (
	_context: K8sContext,
	_target: CustomResourceTarget,
) => {
	// TODO: Implement get cluster logs
	throw new Error("Not implemented");
};

/**
 * Get cluster versions
 */
export const getClusterVersions = async (context: K8sContext) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.get("/version/list");
	return response.data;
};

/**
 * Create cluster
 */
export const createCluster = async (
	context: K8sContext,
	input: ClusterCreateData,
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.post("/", input);
	return response.data;
};

/**
 * Update cluster
 */
export const updateCluster = async (
	context: K8sContext,
	input: ClusterUpdateData,
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.patch(`/${input.name}`, input);
	return response.data;
};

/**
 * Start cluster
 */
export const startCluster = async (context: K8sContext, name: string) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.post(`/${name}/start`, {});
	return response.data;
};

/**
 * Pause cluster
 */
export const pauseCluster = async (context: K8sContext, name: string) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.post(`/${name}/pause`, {});
	return response.data;
};

/**
 * Restart cluster
 */
export const restartCluster = async (context: K8sContext, name: string) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.post(`/${name}/restart`, {});
	return response.data;
};

/**
 * Delete cluster
 */
export const deleteCluster = async (context: K8sContext, name: string) => {
	const api = await createClusterAxios(context);
	const response = await api.delete("/delete", { data: { name } });
	return response.data;
};

/**
 * Create cluster backup
 */
export const createClusterBackup = async (
	context: K8sContext,
	databaseName: string,
	remark?: string,
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.post(`/${databaseName}/backup`, { remark });
	return response.data;
};

/**
 * Delete cluster backup
 */
export const deleteClusterBackup = async (
	context: K8sContext,
	clusterName: string,
	backupName: string,
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.delete(`/${clusterName}/backup/${backupName}`);
	return response.data;
};

/**
 * Restore cluster backup
 */
export const restoreClusterBackup = async (
	context: K8sContext,
	databaseName: string,
	backupName: string,
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.post(`/${databaseName}/backup/${backupName}`);
	return response.data;
};

/**
 * Enable cluster public access
 */
export const enableClusterPublicAccess = async (
	context: K8sContext,
	databaseName: string,
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.post(`/${databaseName}/enablePublic`);
	return response.data;
};

/**
 * Disable cluster public access
 */
export const disableClusterPublicAccess = async (
	context: K8sContext,
	databaseName: string,
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.post(`/${databaseName}/disablePublic`);
	return response.data;
};
