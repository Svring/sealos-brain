"use client";

import { createContext, use, useCallback } from "react";
import type { EventFrom, StateFrom } from "xstate";
import type { ModeContext, modeMachine } from "./mode.state";

interface ModeContextValue {
	mode: ModeContext;
	state: StateFrom<typeof modeMachine>;
	send: (event: EventFrom<typeof modeMachine>) => void;
}

export const modeMachineContext = createContext<ModeContextValue | undefined>(
	undefined,
);

export function useModeContext() {
	const ctx = use(modeMachineContext);
	if (!ctx) {
		throw new Error("useModeContext must be used within ModeAdapter");
	}
	return ctx;
}

export function useModeState() {
	const { state } = useModeContext();

	// Ensure mode is ready, throw error if not
	if (state.matches("initializing")) {
		throw new Error("Mode is still initializing");
	}

	if (state.matches("failed")) {
		throw new Error("Mode initialization failed");
	}

	if (!state.context) {
		throw new Error("No mode configuration available");
	}

	// Directly expose the data fields
	const mode = state.context.mode;
	return {
		mode,
		isDev: mode === "dev",
		isProd: mode === "prod",
		isDemo: mode === "demo",
		isTrial: mode === "trial",
		isInitializing: state.matches("initializing"),
		isReady: state.matches("ready"),
		isFailed: state.matches("failed"),
	};
}

export function useModeEvents() {
	const { send } = useModeContext();

	return {
		setDev: useCallback(() => send({ type: "SET_DEV" }), [send]),
		setProd: useCallback(() => send({ type: "SET_PROD" }), [send]),
		setDemo: useCallback(() => send({ type: "SET_DEMO" }), [send]),
		setTrial: useCallback(() => send({ type: "SET_TRIAL" }), [send]),
		fail: useCallback(() => send({ type: "FAIL" }), [send]),
		retry: useCallback(() => send({ type: "RETRY" }), [send]),
	};
}
