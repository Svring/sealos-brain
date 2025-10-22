"use client";

import type { Message } from "@langchain/langgraph-sdk";
import { assign, createMachine } from "xstate";

// Re-export Message from LangGraph SDK
export type { Message };

// Context interfaces - using any for now
export type ProjectContext = any;
export type ResourceContext = any;

// Graph State interface based on the Python TypedDict
export interface GraphState {
	baseURL?: string | null;
	apiKey?: string | null;
	modelName?: string | null;
	kubeconfigEncoded?: string | null;
	messages: Message[];
	route?: "proposeNode" | "resourceNode" | "projectNode" | null;
	projectContext?: ProjectContext | null;
	resourceContext?: ResourceContext | null;
}

// LangGraph context interface
export interface LangGraphContext {
	graphState: GraphState;
	deploymentUrl: string;
	graphId: string;
}

export type LangGraphEvent =
	| {
			type: "SET_GRAPH_STATE";
			graphState: Partial<GraphState>;
	  }
	| { type: "SET_DEPLOYMENT_URL"; deploymentUrl: string }
	| { type: "SET_GRAPH_ID"; graphId: string }
	| { type: "SET_DEPLOYMENT"; deploymentUrl: string; graphId: string }
	| { type: "UPDATE_GRAPH_STATE"; graphState: Partial<GraphState> }
	| { type: "SET_ROUTE"; route: GraphState["route"] }
	| { type: "ADD_MESSAGE"; message: Message }
	| { type: "SET_PROJECT_CONTEXT"; projectContext: any }
	| { type: "SET_RESOURCE_CONTEXT"; resourceContext: any }
	| { type: "FAIL" }
	| { type: "RETRY" };

export const langgraphMachine = createMachine({
	types: {} as {
		context: LangGraphContext;
		events: LangGraphEvent;
	},
	id: "langgraph",
	initial: "initializing",
	context: {
		graphState: {
			baseURL: null,
			apiKey: null,
			modelName: null,
			kubeconfigEncoded: null,
			messages: [],
			route: null,
			projectContext: null,
			resourceContext: null,
		},
		deploymentUrl: "",
		graphId: "",
	},
	states: {
		initializing: {
			on: {
				SET_GRAPH_STATE: {
					target: "ready",
					actions: assign({
						graphState: ({ context, event }) => ({
							...context.graphState,
							...event.graphState,
						}),
					}),
				},
				FAIL: {
					target: "failed",
				},
			},
		},
		ready: {
			on: {
				SET_GRAPH_STATE: {
					actions: assign({
						graphState: ({ context, event }) => ({
							...context.graphState,
							...event.graphState,
						}),
					}),
				},
				SET_DEPLOYMENT_URL: {
					actions: assign({
						deploymentUrl: ({ event }) => event.deploymentUrl,
					}),
				},
				SET_GRAPH_ID: {
					actions: assign({
						graphId: ({ event }) => event.graphId,
					}),
				},
				SET_DEPLOYMENT: {
					actions: assign({
						deploymentUrl: ({ event }) => event.deploymentUrl,
						graphId: ({ event }) => event.graphId,
					}),
				},
				UPDATE_GRAPH_STATE: {
					actions: assign({
						graphState: ({ context, event }) => ({
							...context.graphState,
							...event.graphState,
						}),
					}),
				},
				SET_ROUTE: {
					actions: assign({
						graphState: ({ context, event }) => ({
							...context.graphState,
							route: event.route,
						}),
					}),
				},
				ADD_MESSAGE: {
					actions: assign({
						graphState: ({ context, event }) => ({
							...context.graphState,
							messages: [...context.graphState.messages, event.message],
						}),
					}),
				},
				SET_PROJECT_CONTEXT: {
					actions: assign({
						graphState: ({ context, event }) => ({
							...context.graphState,
							projectContext: event.projectContext,
						}),
					}),
				},
				SET_RESOURCE_CONTEXT: {
					actions: assign({
						graphState: ({ context, event }) => ({
							...context.graphState,
							resourceContext: event.resourceContext,
						}),
					}),
				},
				FAIL: {
					target: "failed",
				},
			},
		},
		failed: {
			on: {
				RETRY: "initializing",
			},
		},
	},
});
