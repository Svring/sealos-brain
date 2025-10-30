import { getCurrentTaskInput } from "@langchain/langgraph";
import {
	createLaunchpad,
	deleteLaunchpad,
	getLaunchpad,
	pauseLaunchpad,
	restartLaunchpad,
	startLaunchpad,
	updateLaunchpad,
} from "@sealos-brain/sealos/launchpad/api";
import {
	launchpadCreateSchema,
	launchpadUpdateSchema,
} from "@sealos-brain/sealos/launchpad/models";
import { tool } from "langchain";
import * as z from "zod";
import type { State } from "./launchpad.state";

const createContext = (currentTaskInput: State) => ({
	kubeconfig: decodeURIComponent(currentTaskInput.kubeconfigEncoded),
});

// Query Operations
const getLaunchpadTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await getLaunchpad(createContext(currentTaskInput), {
			path: { name: params.name },
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "getLaunchpad",
		description: "Get details of a specific launchpad application by name.",
		schema: z.object({
			name: z.string().describe("Name of the launchpad application"),
		}),
	},
);

// Mutation Operations
const createLaunchpadTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await createLaunchpad(createContext(currentTaskInput), {
			body: params,
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "createLaunchpad",
		description:
			"Create a new launchpad application with specified image, resources, ports, and configuration.",
		schema: launchpadCreateSchema.describe("Launchpad creation parameters"),
	},
);

const updateLaunchpadTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const { name, ...body } = params;
		const result = await updateLaunchpad(createContext(currentTaskInput), {
			path: { name },
			body,
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "updateLaunchpad",
		description:
			"Update a launchpad application configuration (image, resources, ports, etc.).",
		schema: launchpadUpdateSchema.describe("Launchpad update parameters"),
	},
);

const deleteLaunchpadTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await deleteLaunchpad(createContext(currentTaskInput), {
			path: { name: params.name },
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "deleteLaunchpad",
		description: "Delete a launchpad application.",
		schema: z.object({
			name: z.string().describe("Name of the launchpad application to delete"),
		}),
	},
);

const startLaunchpadTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await startLaunchpad(createContext(currentTaskInput), {
			path: { name: params.name },
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "startLaunchpad",
		description: "Start a launchpad application.",
		schema: z.object({
			name: z.string().describe("Name of the launchpad application to start"),
		}),
	},
);

const pauseLaunchpadTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await pauseLaunchpad(createContext(currentTaskInput), {
			path: { name: params.name },
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "pauseLaunchpad",
		description: "Pause a launchpad application.",
		schema: z.object({
			name: z.string().describe("Name of the launchpad application to pause"),
		}),
	},
);

const restartLaunchpadTool = tool(
	async (params) => {
		const currentTaskInput = getCurrentTaskInput() as State;
		const result = await restartLaunchpad(createContext(currentTaskInput), {
			path: { name: params.name },
		});
		return JSON.stringify(result, null, 2);
	},
	{
		name: "restartLaunchpad",
		description: "Restart a launchpad application.",
		schema: z.object({
			name: z.string().describe("Name of the launchpad application to restart"),
		}),
	},
);

export const launchpadTools = [
	getLaunchpadTool,
	createLaunchpadTool,
	updateLaunchpadTool,
	deleteLaunchpadTool,
	startLaunchpadTool,
	pauseLaunchpadTool,
	restartLaunchpadTool,
];
