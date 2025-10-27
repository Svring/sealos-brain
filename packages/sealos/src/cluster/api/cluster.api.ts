"use server";

import https from "node:https";
import type { K8sContext } from "@sealos-brain/k8s/shared/models";
import { getRegionUrlFromKubeconfig } from "@sealos-brain/k8s/shared/utils";
import axios from "axios";
import type { ClusterCreate } from "../models/cluster-create.model";
import type { ClusterUpdate } from "../models/cluster-update.model";

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
// Query Operations
// ============================================================================

/**
 * List all databases
 */
export const listClusters = async (context: K8sContext) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.get("/");
	return response.data.data;
};

/**
 * Get database details
 */
export const getCluster = async (
	context: K8sContext,
	params: { path: { databaseName: string } },
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.get(`/${params.path.databaseName}`);
	return response.data.data;
};

/**
 * Get database versions
 */
export const getClusterVersions = async (context: K8sContext) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.get("/version/list");
	return response.data.data;
};

/**
 * Get database logs data
 */
export const getClusterLogsData = async (
	context: K8sContext,
	params: {
		search: {
			podName: string;
			dbType: "mysql" | "mongodb" | "redis" | "postgresql";
			logType: string;
			logPath: string;
			page?: number;
			pageSize?: number;
		};
	},
) => {
	const api = await createClusterAxios(context);
	const response = await api.get("/logs/data", {
		params: params.search,
	});
	return response.data.data;
};

/**
 * List database log files
 */
export const listClusterLogFiles = async (
	context: K8sContext,
	params: {
		search: {
			podName: string;
			dbType: "mysql" | "mongodb" | "redis" | "postgresql";
			logType: string;
		};
	},
) => {
	const api = await createClusterAxios(context);
	const response = await api.get("/logs/files", {
		params: params.search,
	});
	return response.data.data;
};

// ============================================================================
// Mutation Operations
// ============================================================================

/**
 * Create database
 */
export const createCluster = async (
	context: K8sContext,
	params: {
		body: ClusterCreate & {
			autoBackup?: {
				start?: boolean;
				type?: "day" | "week";
				week?: string[];
				hour?: string;
				minute?: string;
				saveTime?: number;
				saveType?: "days" | "weeks" | "months";
			};
			parameterConfig?: {
				maxConnections?: string;
				timeZone?: string;
				lowerCaseTableNames?: string;
			};
		};
	},
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.post("/", params.body);
	return response.data;
};

/**
 * Update database resources
 */
export const updateCluster = async (
	context: K8sContext,
	params: {
		path: { databaseName: string };
		body: Omit<ClusterUpdate, "name">;
	},
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.patch(`/${params.path.databaseName}`, params.body);
	return response.data;
};

/**
 * Delete database
 */
export const deleteCluster = async (
	context: K8sContext,
	params: { path: { databaseName: string } },
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.delete(`/${params.path.databaseName}`);
	return response.data;
};

/**
 * Start database
 */
export const startCluster = async (
	context: K8sContext,
	params: { path: { databaseName: string } },
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.post(`/${params.path.databaseName}/start`, {});
	return response.data;
};

/**
 * Pause database
 */
export const pauseCluster = async (
	context: K8sContext,
	params: { path: { databaseName: string } },
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.post(`/${params.path.databaseName}/pause`, {});
	return response.data;
};

/**
 * Restart database
 */
export const restartCluster = async (
	context: K8sContext,
	params: { path: { databaseName: string } },
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.post(`/${params.path.databaseName}/restart`, {});
	return response.data;
};

/**
 * Create database backup
 */
export const createClusterBackup = async (
	context: K8sContext,
	params: {
		path: { databaseName: string };
		body?: { remark?: string };
	},
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.post(
		`/${params.path.databaseName}/backup`,
		params.body,
	);
	return response.data;
};

/**
 * Restore database from backup
 */
export const restoreClusterBackup = async (
	context: K8sContext,
	params: {
		path: { databaseName: string; backupName: string };
		body: { newDbName: string };
	},
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.post(
		`/${params.path.databaseName}/backup/${params.path.backupName}`,
		params.body,
	);
	return response.data;
};

/**
 * Delete database backup
 */
export const deleteClusterBackup = async (
	context: K8sContext,
	params: { path: { databaseName: string; backupName: string } },
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.delete(
		`/${params.path.databaseName}/backup/${params.path.backupName}`,
	);
	return response.data;
};

/**
 * Enable database public access
 */
export const enableClusterPublicAccess = async (
	context: K8sContext,
	params: { path: { databaseName: string } },
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.post(
		`/${params.path.databaseName}/enablePublic`,
		{},
	);
	return response.data;
};

/**
 * Disable database public access
 */
export const disableClusterPublicAccess = async (
	context: K8sContext,
	params: { path: { databaseName: string } },
) => {
	const api = await createClusterAxios(context, "v1/database");
	const response = await api.post(
		`/${params.path.databaseName}/disablePublic`,
		{},
	);
	return response.data;
};
