"use server";

import type { K8sContext } from "@sealos-brain/k8s/shared/models";
import { getRegionUrlFromKubeconfig } from "@sealos-brain/k8s/shared/utils";
import { createAxiosClient } from "@sealos-brain/shared/network/utils";
import type { AxiosInstance } from "axios";
import { err, fromPromise, ok, type Result } from "neverthrow";
import type { ClusterCreate } from "../models/cluster-create.model";
import type { ClusterUpdate } from "../models/cluster-update.model";

/**
 * Creates axios instance for cluster API calls
 */
async function createClusterAxios(
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

	const baseURL = `http://dbprovider.${regionUrl}/api/v1/database`;

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
 * List all databases
 */
export const listClusters = async (context: K8sContext): Promise<unknown> => {
	const apiResult = await createClusterAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(api.get("/"), (error) => error as Error).map(
		(response) => response.data.data,
	);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};

/**
 * Get database details
 */
export const getCluster = async (
	context: K8sContext,
	params: { path: { databaseName: string } },
): Promise<unknown> => {
	const apiResult = await createClusterAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.get(`/${params.path.databaseName}`),
		(error) => error as Error,
	).map((response) => response.data.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};

/**
 * Get database versions
 */
export const getClusterVersions = async (
	context: K8sContext,
): Promise<unknown> => {
	const apiResult = await createClusterAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.get("/version/list"),
		(error) => error as Error,
	).map((response) => response.data.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
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
): Promise<unknown> => {
	const apiResult = await createClusterAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.get("/logs/data", {
			params: params.search,
		}),
		(error) => error as Error,
	).map((response) => response.data.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
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
): Promise<unknown> => {
	const apiResult = await createClusterAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.get("/logs/files", {
			params: params.search,
		}),
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
): Promise<unknown> => {
	const apiResult = await createClusterAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.post("/", params.body),
		(error) => error as Error,
	).map((response) => response.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
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
): Promise<unknown> => {
	const apiResult = await createClusterAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.patch(`/${params.path.databaseName}`, params.body),
		(error) => error as Error,
	).map((response) => response.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};

/**
 * Delete database
 */
export const deleteCluster = async (
	context: K8sContext,
	params: { path: { databaseName: string } },
): Promise<unknown> => {
	const apiResult = await createClusterAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.delete(`/${params.path.databaseName}`),
		(error) => error as Error,
	).map((response) => response.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};

/**
 * Start database
 */
export const startCluster = async (
	context: K8sContext,
	params: { path: { databaseName: string } },
): Promise<unknown> => {
	const apiResult = await createClusterAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.post(`/${params.path.databaseName}/start`, {}),
		(error) => error as Error,
	).map((response) => response.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};

/**
 * Pause database
 */
export const pauseCluster = async (
	context: K8sContext,
	params: { path: { databaseName: string } },
): Promise<unknown> => {
	const apiResult = await createClusterAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.post(`/${params.path.databaseName}/pause`, {}),
		(error) => error as Error,
	).map((response) => response.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};

/**
 * Restart database
 */
export const restartCluster = async (
	context: K8sContext,
	params: { path: { databaseName: string } },
): Promise<unknown> => {
	const apiResult = await createClusterAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.post(`/${params.path.databaseName}/restart`, {}),
		(error) => error as Error,
	).map((response) => response.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
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
): Promise<unknown> => {
	const apiResult = await createClusterAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.post(`/${params.path.databaseName}/backup`, params.body),
		(error) => error as Error,
	).map((response) => response.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
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
): Promise<unknown> => {
	const apiResult = await createClusterAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.post(
			`/${params.path.databaseName}/backup/${params.path.backupName}`,
			params.body,
		),
		(error) => error as Error,
	).map((response) => response.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};

/**
 * Delete database backup
 */
export const deleteClusterBackup = async (
	context: K8sContext,
	params: { path: { databaseName: string; backupName: string } },
): Promise<unknown> => {
	const apiResult = await createClusterAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.delete(`/${params.path.databaseName}/backup/${params.path.backupName}`),
		(error) => error as Error,
	).map((response) => response.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};

/**
 * Enable database public access
 */
export const enableClusterPublicAccess = async (
	context: K8sContext,
	params: { path: { databaseName: string } },
): Promise<unknown> => {
	const apiResult = await createClusterAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.post(`/${params.path.databaseName}/enablePublic`, {}),
		(error) => error as Error,
	).map((response) => response.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};

/**
 * Disable database public access
 */
export const disableClusterPublicAccess = async (
	context: K8sContext,
	params: { path: { databaseName: string } },
): Promise<unknown> => {
	const apiResult = await createClusterAxios(context);
	if (apiResult.isErr()) {
		throw apiResult.error;
	}

	const api = apiResult.value;
	const resultAsync = fromPromise(
		api.post(`/${params.path.databaseName}/disablePublic`, {}),
		(error) => error as Error,
	).map((response) => response.data);

	const result = await resultAsync;

	if (result.isErr()) {
		throw result.error;
	}

	return result.value;
};
