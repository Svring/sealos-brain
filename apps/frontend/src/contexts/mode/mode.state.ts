"use client";

import { assign, createMachine } from "xstate";

export type Mode = "dev" | "prod" | "demo" | "trial";

export interface ModeContext {
	mode: Mode | null;
}

export type ModeEvent =
	| { type: "SET_DEV" }
	| { type: "SET_PROD" }
	| { type: "SET_DEMO" }
	| { type: "SET_TRIAL" }
	| { type: "FAIL" }
	| { type: "RETRY" };

export const modeMachine = createMachine({
	types: {} as {
		context: ModeContext;
		events: ModeEvent;
		input: ModeContext;
	},
	id: "mode",
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
				SET_DEV: {
					actions: assign({
						mode: () => "dev",
					}),
				},
				SET_PROD: {
					actions: assign({
						mode: () => "prod",
					}),
				},
				SET_DEMO: {
					actions: assign({
						mode: () => "demo",
					}),
				},
				SET_TRIAL: {
					actions: assign({
						mode: () => "trial",
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
