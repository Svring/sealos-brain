"use client";

import type { Message } from "@langchain/langgraph-sdk";
import { assign, createMachine } from "xstate";

// Re-export Message from LangGraph SDK
export type { Message };

// Graph State interface based on the Python TypedDict
export interface GraphState {
	apiKey?: string | null;
	baseURL?: string | null;
	modelName?: string | null;
	kubeconfigEncoded?: string | null;
	messages: Message[];
}

// LangGraph context interface
export interface LangGraphContext {
	graphState: GraphState;
	deploymentUrl: string;
}

export type LangGraphEvent =
	| {
			type: "SET_GRAPH_STATE";
			graphState: Partial<GraphState>;
	  }
	| { type: "SET_DEPLOYMENT_URL"; deploymentUrl: string }
	| {
			type: "SET_CONFIG";
			deploymentUrl: string;
			graphState: Partial<GraphState>;
	  }
	| { type: "UPDATE_GRAPH_STATE"; graphState: Partial<GraphState> }
	| { type: "ADD_MESSAGE"; message: Message }
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
			apiKey: null,
			baseURL: null,
			modelName: null,
			kubeconfigEncoded: null,
			messages: [],
		},
		deploymentUrl: "",
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
				SET_CONFIG: {
					target: "ready",
					actions: assign({
						deploymentUrl: ({ event }) => event.deploymentUrl,
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
				SET_CONFIG: {
					actions: assign({
						deploymentUrl: ({ event }) => event.deploymentUrl,
						graphState: ({ context, event }) => ({
							...context.graphState,
							...event.graphState,
						}),
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
				ADD_MESSAGE: {
					actions: assign({
						graphState: ({ context, event }) => ({
							...context.graphState,
							messages: [...context.graphState.messages, event.message],
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
