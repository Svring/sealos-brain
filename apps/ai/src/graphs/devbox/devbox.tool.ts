import { getCurrentTaskInput } from "@langchain/langgraph";
import {
	autostartDevbox,
	createDevbox,
	deleteDevbox,
	deleteDevboxRelease,
	deployDevbox,
	getDevbox,
	getDevboxDeploys,
	getDevboxMonitorData,
	getDevboxReleases,
	getDevboxTemplates,
	listDevboxes,
	pauseDevbox,
	releaseDevbox,
	restartDevbox,
	shutdownDevbox,
	startDevbox,
	updateDevbox,
} from "@sealos-brain/sealos/devbox/api";
import {
	devboxCreateSchema,
	devboxUpdateSchema,
} from "@sealos-brain/sealos/devbox/models";
import { tool } from "langchain";
import * as z from "zod";
import type { State } from "./devbox.state";

const createContext = (currentTaskInput: State) => ({
	kubeconfig: decodeURIComponent(currentTaskInput.kubeconfigEncoded),
});

// Query Operations
const listDevboxesTool = tool(
	async () => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await listDevboxes(createContext(currentTaskInput));
		return JSON.stringify(result, null, 2);
	},
	{
		name: "listDevboxes",
		description: "List all devbox instances.",
		schema: z.object({}),
	},
);

const getDevboxTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await getDevbox(createContext(currentTaskInput), {
			path: { name: params.name },
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "getDevbox",
		description: "Get details of a specific devbox instance.",
		schema: z.object({
			name: z.string().describe("Name of the devbox instance"),
		}),
	},
);

const getDevboxTemplatesTool = tool(
	async () => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await getDevboxTemplates(createContext(currentTaskInput));
		return JSON.stringify(result, null, 2);
	},
	{
		name: "getDevboxTemplates",
		description: "Get available devbox templates.",
		schema: z.object({}),
	},
);

const getDevboxReleasesTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await getDevboxReleases(createContext(currentTaskInput), {
			path: { name: params.name },
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "getDevboxReleases",
		description: "Get all releases for a devbox instance.",
		schema: z.object({
			name: z.string().describe("Name of the devbox instance"),
		}),
	},
);

const getDevboxDeploysTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await getDevboxDeploys(createContext(currentTaskInput), {
			path: { name: params.name },
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "getDevboxDeploys",
		description: "Get deployed releases for a devbox instance.",
		schema: z.object({
			name: z.string().describe("Name of the devbox instance"),
		}),
	},
);

const getDevboxMonitorDataTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await getDevboxMonitorData(createContext(currentTaskInput), {
			path: { name: params.name },
			search: params.search,
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "getDevboxMonitorData",
		description:
			"Get monitoring data for a devbox instance (CPU, memory metrics).",
		schema: z.object({
			name: z.string().describe("Name of the devbox instance"),
			search: z
				.object({
					start: z.string().optional().describe("Start time for metrics"),
					end: z.string().optional().describe("End time for metrics"),
					step: z.string().optional().describe("Step interval for metrics"),
				})
				.optional(),
		}),
	},
);

// Mutation Operations
const createDevboxTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await createDevbox(createContext(currentTaskInput), {
			body: params,
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "createDevbox",
		description:
			"Create a new devbox (development environment) with specified runtime, resources, and configuration.",
		schema: devboxCreateSchema.describe("Devbox creation parameters"),
	},
);

const updateDevboxTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const { name, ...body } = params;
		const result = await updateDevbox(createContext(currentTaskInput), {
			path: { name },
			body,
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "updateDevbox",
		description:
			"Update a devbox instance configuration (resources, ports, etc.).",
		schema: devboxUpdateSchema.describe("Devbox update parameters"),
	},
);

const deleteDevboxTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await deleteDevbox(createContext(currentTaskInput), {
			path: { name: params.name },
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "deleteDevbox",
		description: "Delete a devbox instance.",
		schema: z.object({
			name: z.string().describe("Name of the devbox instance to delete"),
		}),
	},
);

const startDevboxTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await startDevbox(createContext(currentTaskInput), {
			path: { name: params.name },
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "startDevbox",
		description: "Start a devbox instance.",
		schema: z.object({
			name: z.string().describe("Name of the devbox instance to start"),
		}),
	},
);

const pauseDevboxTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await pauseDevbox(createContext(currentTaskInput), {
			path: { name: params.name },
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "pauseDevbox",
		description: "Pause a devbox instance.",
		schema: z.object({
			name: z.string().describe("Name of the devbox instance to pause"),
		}),
	},
);

const shutdownDevboxTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await shutdownDevbox(createContext(currentTaskInput), {
			path: { name: params.name },
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "shutdownDevbox",
		description: "Shutdown a devbox instance.",
		schema: z.object({
			name: z.string().describe("Name of the devbox instance to shutdown"),
		}),
	},
);

const restartDevboxTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await restartDevbox(createContext(currentTaskInput), {
			path: { name: params.name },
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "restartDevbox",
		description: "Restart a devbox instance.",
		schema: z.object({
			name: z.string().describe("Name of the devbox instance to restart"),
		}),
	},
);

const autostartDevboxTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await autostartDevbox(createContext(currentTaskInput), {
			path: { name: params.name },
			body: params.execCommand
				? { execCommand: params.execCommand }
				: undefined,
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "autostartDevbox",
		description:
			"Configure autostart settings for a devbox instance with optional exec command.",
		schema: z.object({
			name: z.string().describe("Name of the devbox instance"),
			execCommand: z
				.string()
				.optional()
				.describe("Command to execute on autostart"),
		}),
	},
);

const releaseDevboxTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await releaseDevbox(createContext(currentTaskInput), {
			path: { name: params.name },
			body: {
				tag: params.tag,
				releaseDes: params.releaseDes,
			},
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "releaseDevbox",
		description:
			"Create a new release (snapshot) of a devbox instance with a tag and optional description.",
		schema: z.object({
			name: z.string().describe("Name of the devbox instance"),
			tag: z.string().describe("Tag name for the release"),
			releaseDes: z
				.string()
				.optional()
				.describe("Optional description for the release"),
		}),
	},
);

const deleteDevboxReleaseTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await deleteDevboxRelease(createContext(currentTaskInput), {
			path: { name: params.name, tag: params.tag },
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "deleteDevboxRelease",
		description: "Delete a specific release (snapshot) of a devbox instance.",
		schema: z.object({
			name: z.string().describe("Name of the devbox instance"),
			tag: z.string().describe("Tag name of the release to delete"),
		}),
	},
);

const deployDevboxTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await deployDevbox(createContext(currentTaskInput), {
			path: { name: params.name, tag: params.tag },
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "deployDevbox",
		description: "Deploy a specific release (snapshot) of a devbox instance.",
		schema: z.object({
			name: z.string().describe("Name of the devbox instance"),
			tag: z.string().describe("Tag name of the release to deploy"),
		}),
	},
);

export const devboxTools = [
	listDevboxesTool,
	getDevboxTool,
	getDevboxTemplatesTool,
	getDevboxReleasesTool,
	getDevboxDeploysTool,
	getDevboxMonitorDataTool,
	createDevboxTool,
	updateDevboxTool,
	deleteDevboxTool,
	startDevboxTool,
	pauseDevboxTool,
	shutdownDevboxTool,
	restartDevboxTool,
	autostartDevboxTool,
	releaseDevboxTool,
	deleteDevboxReleaseTool,
	deployDevboxTool,
];
