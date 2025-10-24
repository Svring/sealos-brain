"use client";

import { composeAiProxyChatUrl } from "@sealos-brain/sealos/ai-proxy/utils";
import { useMachine } from "@xstate/react";
import { type ReactNode, useEffect, useRef } from "react";
import { useProxyCreate } from "@/hooks/sealos/ai-proxy/use-proxy-create";
import { useProxyToken } from "@/hooks/sealos/ai-proxy/use-proxy-token";
import { useAuthState } from "../auth/auth.context";
import { proxyMachineContext } from "./proxy.context";
import { proxyMachine } from "./proxy.state";

export function ProxyAdapter({ children }: { children: ReactNode }) {
	const [state, send] = useMachine(proxyMachine);
	const { auth } = useAuthState();

	const { data } = useProxyToken();
	const createProxy = useProxyCreate();
	const isCreatingRef = useRef(false);

	useEffect(() => {
		if (!data) return;

		// Look for a token with name 'brain'
		const brainToken = data.find(
			(token: { name: string; key: string }) => token.name === "brain",
		);

		if (brainToken) {
			// Use the 'brain' token
			send({
				type: "SET_CONFIG",
				baseURL: composeAiProxyChatUrl(auth.regionUrl),
				apiKey: brainToken.key,
				modelName: "gpt-4.1",
			});
		} else if (!isCreatingRef.current) {
			// No 'brain' token found, create a new one
			isCreatingRef.current = true;
			createProxy.mutate(
				{ name: `brain` },
				{
					onSuccess: () => {
						// After successful token creation, reload the page to remount component
						window.location.reload();
					},
					onError: () => {
						// Reset flag on error so user can retry
						isCreatingRef.current = false;
					},
				},
			);
		}
	}, [data, send, auth?.regionUrl, createProxy]);

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
