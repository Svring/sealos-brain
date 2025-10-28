"use client";

import { useMount } from "@reactuses/core";
import { listTokens } from "@sealos-brain/sealos/ai-proxy/api";
import { composeAiProxyChatUrl } from "@sealos-brain/sealos/ai-proxy/utils";
import { useMachine } from "@xstate/react";
import type { ReactNode } from "react";
import { useProxyCreate } from "@/hooks/sealos/ai-proxy/use-proxy-create";
import { useAuthState } from "../auth/auth.context";
import { proxyMachineContext } from "./proxy.context";
import { proxyMachine } from "./proxy.state";

export function ProxyAdapter({ children }: { children: ReactNode }) {
	const [state, send] = useMachine(proxyMachine);
	const { auth } = useAuthState();
	const createProxy = useProxyCreate();

	useMount(() => {
		void listTokens({
			regionUrl: auth.regionUrl,
			authorization: auth.appToken,
		})
			.then((data) => {
				// Look for a token with name 'brain'
				const brainToken = data.find(
					(token: { name: string; key: string }) => token.name === "brain",
				);
				return brainToken;
			})
			.then((brainToken) => {
				console.log("brainToken", brainToken);
				if (brainToken) {
					console.log("Using existing 'brain' token");
					// Use the existing 'brain' token
					send({
						type: "SET_CONFIG",
						baseURL: composeAiProxyChatUrl(auth.regionUrl),
						apiKey: brainToken.key,
						modelName: "gpt-4.1",
					});
				} else {
					console.log("No 'brain' token found, creating a new one");
					// No 'brain' token found, create a new one
					createProxy.mutate(
						{ name: `brain` },
						{
							onSuccess: () => {
								// After successful token creation, reload the page to remount component
								window.location.reload();
							},
						},
					);
				}
			});
	});

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
