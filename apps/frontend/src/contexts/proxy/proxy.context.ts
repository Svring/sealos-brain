"use client";

import { createContext, use, useCallback } from "react";
import type { EventFrom, StateFrom } from "xstate";
import type { proxyMachine } from "./proxy.state";

interface ProxyContextValue {
	baseURL: string;
	apiKey: string;
	modelName: string;
	state: StateFrom<typeof proxyMachine>;
	send: (event: EventFrom<typeof proxyMachine>) => void;
}

export const proxyMachineContext = createContext<ProxyContextValue | undefined>(
	undefined,
);

export function useProxyContext() {
	const ctx = use(proxyMachineContext);
	if (!ctx) {
		throw new Error("useProxyContext must be used within ProxyAdapter");
	}
	return ctx;
}

export function useProxyState() {
	const { state } = useProxyContext();

	// Ensure proxy is ready, throw error if not
	if (state.matches("initializing")) {
		throw new Error("Proxy is still initializing");
	}

	if (state.matches("failed")) {
		throw new Error("Proxy initialization failed");
	}

	if (!state.context) {
		throw new Error("No proxy configuration available");
	}

	// Directly expose the three data fields
	return {
		baseURL: state.context.baseURL,
		apiKey: state.context.apiKey,
		modelName: state.context.modelName,
		isInitializing: state.matches("initializing"),
		isReady: state.matches("ready"),
		isFailed: state.matches("failed"),
	};
}

export function useProxyEvents() {
	const { send } = useProxyContext();

	return {
		setConfig: useCallback((baseURL: string, apiKey: string, modelName: string) =>
			send({ type: "SET_CONFIG", baseURL, apiKey, modelName }), [send]),
		setModelName: useCallback((modelName: string) =>
			send({ type: "SET_MODEL_NAME", modelName }), [send]),
		fail: useCallback(() => send({ type: "FAIL" }), [send]),
		retry: useCallback(() => send({ type: "RETRY" }), [send]),
	};
}
