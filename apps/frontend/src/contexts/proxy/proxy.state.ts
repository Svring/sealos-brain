"use client";

import { assign, createMachine } from "xstate";

// Proxy context interface
export interface ProxyContext {
	baseURL: string;
	apiKey: string;
	modelName: string;
}

export type ProxyEvent =
	| { type: "SET_CONFIG"; baseURL: string; apiKey: string; modelName: string }
	| { type: "SET_MODEL_NAME"; modelName: string }
	| { type: "FAIL" }
	| { type: "RETRY" };

export const proxyMachine = createMachine({
	types: {} as {
		context: ProxyContext;
		events: ProxyEvent;
	},
	id: "proxy",
	initial: "initializing",
	context: {
		baseURL: "",
		apiKey: "",
		modelName: "gpt-4",
	},
	states: {
		initializing: {
			on: {
				SET_CONFIG: {
					target: "ready",
					actions: assign({
						baseURL: ({ event }) => event.baseURL,
						apiKey: ({ event }) => event.apiKey,
						modelName: ({ event }) => event.modelName,
					}),
				},
				FAIL: {
					target: "failed",
				},
			},
		},
		ready: {
			on: {
				SET_MODEL_NAME: {
					actions: assign({
						modelName: ({ event }) => event.modelName,
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
