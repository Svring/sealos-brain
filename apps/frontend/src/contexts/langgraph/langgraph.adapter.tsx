"use client";

import { useMachine } from "@xstate/react";
import { type ReactNode, useEffect } from "react";
import { useAuthState } from "@/contexts/auth/auth.context";
import { useProxyState } from "@/contexts/proxy/proxy.context";
import { langgraphMachineContext } from "./langgraph.context";
import { langgraphMachine } from "./langgraph.state";

interface LangGraphContext {
	deploymentUrl: string;
	graphId: string;
}

export function LangGraphAdapter({
	children,
	langgraphContext,
}: {
	children: ReactNode;
	langgraphContext: LangGraphContext;
}) {
	const [state, send] = useMachine(langgraphMachine);
	const { baseURL, apiKey, modelName } = useProxyState();
	const { auth } = useAuthState();

	// Handle langgraph config updates in useEffect to avoid setState during render
	useEffect(() => {
		// Set deployment URL and graph ID from environment in one event
		send({
			type: "SET_DEPLOYMENT",
			deploymentUrl: langgraphContext.deploymentUrl,
			graphId: langgraphContext.graphId,
		});

		// Set config from proxy state
		send({
			type: "SET_GRAPH_STATE",
			graphState: {
				baseURL,
				apiKey,
				modelName,
				kubeconfigEncoded: auth?.kubeconfigEncoded || "",
			},
		});
	}, [
		langgraphContext,
		baseURL,
		apiKey,
		modelName,
		send,
		auth?.kubeconfigEncoded,
	]);

	if (state.matches("initializing") || !state.matches("ready")) {
		return null;
	}

	return (
		<langgraphMachineContext.Provider
			value={{
				graphState: state.context.graphState,
				deploymentUrl: state.context.deploymentUrl,
				graphId: state.context.graphId,
				state,
				send,
			}}
		>
			{children}
		</langgraphMachineContext.Provider>
	);
}
