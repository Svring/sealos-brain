"use client";

import { assign, createMachine } from "xstate";

// Environment variables interface
export interface EnvVariables {
	[key: string]: string | undefined;
}

export interface EnvContext {
	variables: EnvVariables | null;
}

export type EnvEvent =
	| {
			type: "SET_ENV";
			variables: EnvVariables;
	  }
	| { type: "FAIL" }
	| { type: "RETRY" };

export const envMachine = createMachine({
	types: {} as {
		context: EnvContext;
		events: EnvEvent;
		input: EnvContext;
	},
	id: "env",
	initial: "initializing",
	context: ({ input }) => input,
	states: {
		initializing: {
			always: {
				target: "ready",
			},
			on: {
				FAIL: {
					target: "failed",
				},
			},
		},
		ready: {
			on: {
				SET_ENV: {
					actions: assign({
						variables: ({ event }) => event.variables,
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
