"use client";

import { useMount } from "@reactuses/core";
import { listTokens } from "@sealos-brain/sealos/ai-proxy/api";
import { composeAiProxyChatUrl } from "@sealos-brain/sealos/ai-proxy/utils";
import { ResultAsync } from "neverthrow";
import { toast } from "sonner";
import type { EventFrom } from "xstate";
import { useAuthState } from "@/contexts/auth/auth.context";
import type { proxyMachine } from "@/contexts/proxy/proxy.state";
import { useProxyCreate } from "@/hooks/sealos/ai-proxy/use-proxy-create";

export function useMainProxy(
	send: (event: EventFrom<typeof proxyMachine>) => void,
) {
	const { auth } = useAuthState();
	const createProxy = useProxyCreate();

	useMount(async () => {
		await ResultAsync.fromPromise(
			listTokens({
				regionUrl: auth.regionUrl,
				authorization: auth.appToken,
			}),
			(error) => new Error(`Failed to list tokens: ${error}`),
		)
			.map((data) => {
				const tokens = data as Array<{ name: string; key: string }>;
				// Look for a token with name 'brain'
				return tokens.find(
					(token: { name: string; key: string }) => token.name === "brain",
				);
			})
			.match(
				(brainToken) => {
					if (brainToken) {
						send({
							type: "SET_CONFIG",
							baseURL: composeAiProxyChatUrl(auth.regionUrl),
							apiKey: brainToken.key,
							modelName: "gpt-4.1",
						});
					} else {
						createProxy.mutate(
							{ name: `brain` },
							{
								onSuccess: () => {
									window.location.reload();
								},
							},
						);
					}
				},
				(error) => {
					toast.error(`Failed to list tokens: ${error.message}`);
				},
			);
	});
}
