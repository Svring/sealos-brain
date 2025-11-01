"use client";

import { useMount } from "@reactuses/core";
import { useMachine } from "@xstate/react";
import type { ReactNode } from "react";
import { useAuthState } from "@/contexts/auth/auth.context";
import { useEnvState } from "@/contexts/env/env.context";
import { useProxyState } from "@/contexts/proxy/proxy.context";
import { langgraphMachineContext } from "./langgraph.context";
import { langgraphMachine } from "./langgraph.state";

export function LangGraphAdapter({ children }: { children: ReactNode }) {
	const [state, send] = useMachine(langgraphMachine);
	const { apiKey, baseURL, modelName } = useProxyState();
	const { auth } = useAuthState();
	const { variables } = useEnvState();

	// Handle langgraph config initialization on mount
	useMount(() => {
		// Get deployment URL from env context
		const deploymentUrl = variables?.LANGGRAPH_DEPLOYMENT_URL || "";

		// Set deployment URL and graph state in one go
		send({
			type: "SET_CONFIG",
			deploymentUrl,
			graphState: {
				apiKey,
				baseURL,
				modelName,
				kubeconfigEncoded: auth?.kubeconfigEncoded || "",
			},
		});
	});

	if (state.matches("initializing") || !state.matches("ready")) {
		return null;
	}

	return (
		<langgraphMachineContext.Provider
			value={{
				graphState: state.context.graphState,
				deploymentUrl: state.context.deploymentUrl,
				state,
				send,
			}}
		>
			{children}
		</langgraphMachineContext.Provider>
	);
}
