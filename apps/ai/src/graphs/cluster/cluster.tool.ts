import { getCurrentTaskInput } from "@langchain/langgraph";
import {
	createCluster,
	createClusterBackup,
	deleteCluster,
	deleteClusterBackup,
	disableClusterPublicAccess,
	enableClusterPublicAccess,
	getCluster,
	getClusterLogsData,
	getClusterVersions,
	listClusterLogFiles,
	listClusters,
	pauseCluster,
	restartCluster,
	restoreClusterBackup,
	startCluster,
	updateCluster,
} from "@sealos-brain/sealos/cluster/api";
import {
	clusterCreateSchema,
	clusterUpdateSchema,
} from "@sealos-brain/sealos/cluster/models";
import { tool } from "langchain";
import * as z from "zod";
import type { State } from "./cluster.state";

const createContext = (currentTaskInput: State) => ({
	kubeconfig: decodeURIComponent(currentTaskInput.kubeconfigEncoded),
});

// Query Operations
const listClustersTool = tool(
	async () => {
		try {
			const currentTaskInput = getCurrentTaskInput() as State;
			const data = await listClusters(createContext(currentTaskInput));
			return JSON.stringify(data, null, 2);
		} catch (error) {
			return JSON.stringify({ error: error instanceof Error ? error.message : String(error) }, null, 2);
		}
	},
	{
		name: "listClusters",
		description: "List all database clusters.",
		schema: z.object({}),
	},
);

const getClusterTool = tool(
	async (params) => {
		try {
			const currentTaskInput = getCurrentTaskInput() as State;
			const data = await getCluster(createContext(currentTaskInput), {
				path: { databaseName: params.databaseName },
			});
			return JSON.stringify(data, null, 2);
		} catch (error) {
			return JSON.stringify({ error: error instanceof Error ? error.message : String(error) }, null, 2);
		}
	},
	{
		name: "getCluster",
		description: "Get details of a specific database cluster.",
		schema: z.object({
			databaseName: z.string().describe("Name of the database cluster"),
		}),
	},
);

const getClusterVersionsTool = tool(
	async () => {
		try {
			const currentTaskInput = getCurrentTaskInput() as State;
			const data = await getClusterVersions(createContext(currentTaskInput));
			return JSON.stringify(data, null, 2);
		} catch (error) {
			return JSON.stringify({ error: error instanceof Error ? error.message : String(error) }, null, 2);
		}
	},
	{
		name: "getClusterVersions",
		description: "Get available database versions.",
		schema: z.object({}),
	},
);

const getClusterLogsDataTool = tool(
	async (params) => {
		try {
			const currentTaskInput = getCurrentTaskInput() as State;
			const data = await getClusterLogsData(createContext(currentTaskInput), {
				search: params.search,
			});
			return JSON.stringify(data, null, 2);
		} catch (error) {
			return JSON.stringify({ error: error instanceof Error ? error.message : String(error) }, null, 2);
		}
	},
	{
		name: "getClusterLogsData",
		description: "Get logs data for a database cluster pod.",
		schema: z.object({
			search: z.object({
				podName: z.string().describe("Name of the pod"),
				dbType: z
					.enum(["mysql", "mongodb", "redis", "postgresql"])
					.describe("Database type"),
				logType: z.string().describe("Type of log"),
				logPath: z.string().describe("Path to the log file"),
				page: z.number().optional().describe("Page number for pagination"),
				pageSize: z.number().optional().describe("Page size for pagination"),
			}),
		}),
	},
);

const listClusterLogFilesTool = tool(
	async (params) => {
		try {
			const currentTaskInput = getCurrentTaskInput() as State;
			const data = await listClusterLogFiles(createContext(currentTaskInput), {
				search: params.search,
			});
			return JSON.stringify(data, null, 2);
		} catch (error) {
			return JSON.stringify({ error: error instanceof Error ? error.message : String(error) }, null, 2);
		}
	},
	{
		name: "listClusterLogFiles",
		description: "List log files for a database cluster pod.",
		schema: z.object({
			search: z.object({
				podName: z.string().describe("Name of the pod"),
				dbType: z
					.enum(["mysql", "mongodb", "redis", "postgresql"])
					.describe("Database type"),
				logType: z.string().describe("Type of log"),
			}),
		}),
	},
);

// Mutation Operations
const createClusterSchema = clusterCreateSchema.extend({
	autoBackup: z
		.object({
			start: z.boolean().optional(),
			type: z.enum(["day", "week"]).optional(),
			week: z.array(z.string()).optional(),
			hour: z.string().optional(),
			minute: z.string().optional(),
			saveTime: z.number().optional(),
			saveType: z.enum(["days", "weeks", "months"]).optional(),
		})
		.optional()
		.describe("Auto backup configuration"),
	parameterConfig: z
		.object({
			maxConnections: z.string().optional(),
			timeZone: z.string().optional(),
			lowerCaseTableNames: z.string().optional(),
		})
		.optional()
		.describe("Database parameter configuration"),
});

const createClusterTool = tool(
	async (params) => {
		try {
			const currentTaskInput = getCurrentTaskInput() as State;
			const data = await createCluster(createContext(currentTaskInput), {
				body: params,
			});
			return JSON.stringify(data, null, 2);
		} catch (error) {
			return JSON.stringify({ error: error instanceof Error ? error.message : String(error) }, null, 2);
		}
	},
	{
		name: "createCluster",
		description:
			"Create a new database cluster (PostgreSQL, MongoDB, Redis, etc.) with specified type, version, resources, and configuration. Can include optional autoBackup and parameterConfig settings.",
		schema: createClusterSchema.describe("Cluster creation parameters"),
	},
);

const updateClusterTool = tool(
	async (params) => {
		try {
			const currentTaskInput = getCurrentTaskInput() as State;
			const { name, ...body } = params;
			const data = await updateCluster(createContext(currentTaskInput), {
				path: { databaseName: name },
				body,
			});
			return JSON.stringify(data, null, 2);
		} catch (error) {
			return JSON.stringify({ error: error instanceof Error ? error.message : String(error) }, null, 2);
		}
	},
	{
		name: "updateCluster",
		description: "Update a database cluster configuration (resources, etc.).",
		schema: clusterUpdateSchema.describe("Cluster update parameters"),
	},
);

const deleteClusterTool = tool(
	async (params) => {
		try {
			const currentTaskInput = getCurrentTaskInput() as State;
			const data = await deleteCluster(createContext(currentTaskInput), {
				path: { databaseName: params.databaseName },
			});
			return JSON.stringify(data, null, 2);
		} catch (error) {
			return JSON.stringify({ error: error instanceof Error ? error.message : String(error) }, null, 2);
		}
	},
	{
		name: "deleteCluster",
		description: "Delete a database cluster.",
		schema: z.object({
			databaseName: z
				.string()
				.describe("Name of the database cluster to delete"),
		}),
	},
);

const startClusterTool = tool(
	async (params) => {
		try {
			const currentTaskInput = getCurrentTaskInput() as State;
			const data = await startCluster(createContext(currentTaskInput), {
				path: { databaseName: params.databaseName },
			});
			return JSON.stringify(data, null, 2);
		} catch (error) {
			return JSON.stringify({ error: error instanceof Error ? error.message : String(error) }, null, 2);
		}
	},
	{
		name: "startCluster",
		description: "Start a database cluster.",
		schema: z.object({
			databaseName: z
				.string()
				.describe("Name of the database cluster to start"),
		}),
	},
);

const pauseClusterTool = tool(
	async (params) => {
		try {
			const currentTaskInput = getCurrentTaskInput() as State;
			const data = await pauseCluster(createContext(currentTaskInput), {
				path: { databaseName: params.databaseName },
			});
			return JSON.stringify(data, null, 2);
		} catch (error) {
			return JSON.stringify({ error: error instanceof Error ? error.message : String(error) }, null, 2);
		}
	},
	{
		name: "pauseCluster",
		description: "Pause a database cluster.",
		schema: z.object({
			databaseName: z
				.string()
				.describe("Name of the database cluster to pause"),
		}),
	},
);

const restartClusterTool = tool(
	async (params) => {
		try {
			const currentTaskInput = getCurrentTaskInput() as State;
			const data = await restartCluster(createContext(currentTaskInput), {
				path: { databaseName: params.databaseName },
			});
			return JSON.stringify(data, null, 2);
		} catch (error) {
			return JSON.stringify({ error: error instanceof Error ? error.message : String(error) }, null, 2);
		}
	},
	{
		name: "restartCluster",
		description: "Restart a database cluster.",
		schema: z.object({
			databaseName: z
				.string()
				.describe("Name of the database cluster to restart"),
		}),
	},
);

const createClusterBackupTool = tool(
	async (params) => {
		try {
			const currentTaskInput = getCurrentTaskInput() as State;
			const data = await createClusterBackup(createContext(currentTaskInput), {
				path: { databaseName: params.databaseName },
				body: params.remark ? { remark: params.remark } : undefined,
			});
			return JSON.stringify(data, null, 2);
		} catch (error) {
			return JSON.stringify({ error: error instanceof Error ? error.message : String(error) }, null, 2);
		}
	},
	{
		name: "createClusterBackup",
		description: "Create a backup for a database cluster.",
		schema: z.object({
			databaseName: z.string().describe("Name of the database cluster"),
			remark: z.string().optional().describe("Optional remark for the backup"),
		}),
	},
);

const restoreClusterBackupTool = tool(
	async (params) => {
		try {
			const currentTaskInput = getCurrentTaskInput() as State;
			const data = await restoreClusterBackup(createContext(currentTaskInput), {
				path: {
					databaseName: params.databaseName,
					backupName: params.backupName,
				},
				body: { newDbName: params.newDbName },
			});
			return JSON.stringify(data, null, 2);
		} catch (error) {
			return JSON.stringify({ error: error instanceof Error ? error.message : String(error) }, null, 2);
		}
	},
	{
		name: "restoreClusterBackup",
		description: "Restore a database cluster from a backup.",
		schema: z.object({
			databaseName: z.string().describe("Name of the source database cluster"),
			backupName: z.string().describe("Name of the backup to restore"),
			newDbName: z.string().describe("Name for the new restored database"),
		}),
	},
);

const deleteClusterBackupTool = tool(
	async (params) => {
		try {
			const currentTaskInput = getCurrentTaskInput() as State;
			const data = await deleteClusterBackup(createContext(currentTaskInput), {
				path: {
					databaseName: params.databaseName,
					backupName: params.backupName,
				},
			});
			return JSON.stringify(data, null, 2);
		} catch (error) {
			return JSON.stringify({ error: error instanceof Error ? error.message : String(error) }, null, 2);
		}
	},
	{
		name: "deleteClusterBackup",
		description: "Delete a backup for a database cluster.",
		schema: z.object({
			databaseName: z.string().describe("Name of the database cluster"),
			backupName: z.string().describe("Name of the backup to delete"),
		}),
	},
);

const enableClusterPublicAccessTool = tool(
	async (params) => {
		try {
			const currentTaskInput = getCurrentTaskInput() as State;
			const data = await enableClusterPublicAccess(
				createContext(currentTaskInput),
				{
					path: { databaseName: params.databaseName },
				},
			);
			return JSON.stringify(data, null, 2);
		} catch (error) {
			return JSON.stringify({ error: error instanceof Error ? error.message : String(error) }, null, 2);
		}
	},
	{
		name: "enableClusterPublicAccess",
		description: "Enable public access for a database cluster.",
		schema: z.object({
			databaseName: z.string().describe("Name of the database cluster"),
		}),
	},
);

const disableClusterPublicAccessTool = tool(
	async (params) => {
		try {
			const currentTaskInput = getCurrentTaskInput() as State;
			const data = await disableClusterPublicAccess(
				createContext(currentTaskInput),
				{
					path: { databaseName: params.databaseName },
				},
			);
			return JSON.stringify(data, null, 2);
		} catch (error) {
			return JSON.stringify({ error: error instanceof Error ? error.message : String(error) }, null, 2);
		}
	},
	{
		name: "disableClusterPublicAccess",
		description: "Disable public access for a database cluster.",
		schema: z.object({
			databaseName: z.string().describe("Name of the database cluster"),
		}),
	},
);

export const clusterTools = [
	listClustersTool,
	getClusterTool,
	getClusterVersionsTool,
	getClusterLogsDataTool,
	listClusterLogFilesTool,
	createClusterTool,
	updateClusterTool,
	deleteClusterTool,
	startClusterTool,
	pauseClusterTool,
	restartClusterTool,
	createClusterBackupTool,
	restoreClusterBackupTool,
	deleteClusterBackupTool,
	enableClusterPublicAccessTool,
	disableClusterPublicAccessTool,
];
