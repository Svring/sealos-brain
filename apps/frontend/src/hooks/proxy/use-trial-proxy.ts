"use client";

import { useMount } from "@reactuses/core";
import type { EventFrom } from "xstate";
import type { proxyMachine } from "@/contexts/proxy/proxy.state";

export function useTrialProxy(
	send: (event: EventFrom<typeof proxyMachine>) => void,
) {
	useMount(() => {
		send({
			type: "SET_CONFIG",
			baseURL: "trial",
			apiKey: "trial",
			modelName: "trial",
		});
	});
}
