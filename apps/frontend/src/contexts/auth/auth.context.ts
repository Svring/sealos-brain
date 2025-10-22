"use client";

import { createContext, use, useCallback } from "react";
import type { EventFrom, StateFrom } from "xstate";
import type { Auth, authMachine } from "./auth.state";

interface AuthContextValue {
	auth: Auth | null;
	state: StateFrom<typeof authMachine>;
	send: (event: EventFrom<typeof authMachine>) => void;
}

export const authMachineContext = createContext<AuthContextValue | undefined>(
	undefined,
);

export function useAuthContext() {
	const ctx = use(authMachineContext);
	if (!ctx) {
		throw new Error("useAuthContext must be used within AuthAdapter");
	}
	return ctx;
}

export function useAuthState() {
	const { state } = useAuthContext();
	
	// Ensure auth exists, throw error if not ready or failed
	if (state.matches("initializing")) {
		throw new Error("Auth is still initializing");
	}
	
	if (state.matches("failed")) {
		throw new Error("Auth initialization failed");
	}
	
	if (!state.context.auth) {
		throw new Error("No auth available");
	}
	
	return {
		auth: state.context.auth,
		isInitializing: state.matches("initializing"),
		isReady: state.matches("ready"),
		isFailed: state.matches("failed"),
	};
}

export function useAuthEvents() {
	const { send } = useAuthContext();

	return {
		setAuth: useCallback((auth: Auth) => send({ type: "SET_AUTH", auth }), [send]),
		fail: useCallback(() => send({ type: "FAIL" }), [send]),
		retry: useCallback(() => send({ type: "RETRY" }), [send]),
	};
}
