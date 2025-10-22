"use client";

import { assign, createMachine } from "xstate";

// Simplified Auth interface
export interface Auth {
	kubeconfigEncoded: string;
	appToken: string;
	regionUrl: string;
}

export interface AuthContext {
	auth: Auth | null;
}

export type AuthEvent =
	| { type: "SET_AUTH"; auth: Auth }
	| { type: "FAIL" }
	| { type: "RETRY" };

export const authMachine = createMachine({
	types: {} as {
		context: AuthContext;
		events: AuthEvent;
	},
	id: "auth",
	initial: "initializing",
	context: {
		auth: null,
	},
	states: {
		initializing: {
			on: {
				SET_AUTH: {
					target: "ready",
					actions: assign({ auth: ({ event }) => event.auth }),
				},
				FAIL: {
					target: "failed",
				},
			},
		},
		ready: {
			on: {
				FAIL: {
					target: "failed",
				},
			},
		},
		failed: {
			on: {
				SET_AUTH: {
					target: "ready",
					actions: assign({ auth: ({ event }) => event.auth }),
				},
				RETRY: "initializing",
			},
		},
	},
});
