"use client";

import { useMachine } from "@xstate/react";
import type { ReactNode } from "react";
import { useModeState } from "@/contexts/mode/mode.context";
import { useMainProxy } from "@/hooks/proxy/use-main-proxy";
import { useTrialProxy } from "@/hooks/proxy/use-trial-proxy";
import { proxyMachineContext } from "./proxy.context";
import { proxyMachine } from "./proxy.state";

export function ProxyMainAdapter({ children }: { children: ReactNode }) {
	const [state, send] = useMachine(proxyMachine);

	useMainProxy(send);

	if (state.matches("initializing") || !state.matches("ready")) {
		return null;
	}

	return (
		<proxyMachineContext.Provider
			value={{
				baseURL: state.context.baseURL,
				apiKey: state.context.apiKey,
				modelName: state.context.modelName,
				state,
				send,
			}}
		>
			{children}
		</proxyMachineContext.Provider>
	);
}

export function ProxyTrialAdapter({ children }: { children: ReactNode }) {
	const [state, send] = useMachine(proxyMachine);

	useTrialProxy(send);

	// Block children until proxy is ready
	if (state.matches("initializing") || !state.matches("ready")) {
		return null;
	}

	return (
		<proxyMachineContext.Provider
			value={{
				baseURL: state.context.baseURL,
				apiKey: state.context.apiKey,
				modelName: state.context.modelName,
				state,
				send,
			}}
		>
			{children}
		</proxyMachineContext.Provider>
	);
}

export function ProxyAdapter({ children }: { children: ReactNode }) {
	const { isTrial } = useModeState();

	// Route to appropriate adapter based on mode
	if (isTrial) {
		return <ProxyTrialAdapter>{children}</ProxyTrialAdapter>;
	}

	return <ProxyMainAdapter>{children}</ProxyMainAdapter>;
}
