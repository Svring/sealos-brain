"use client";

import { useMount } from "@reactuses/core";
import type { EventFrom } from "xstate";
import type { authMachine } from "@/contexts/auth/auth.state";

export function useTrialAuth(
	send: (event: EventFrom<typeof authMachine>) => void,
) {
	// Set all auth fields to 'trial' on mount
	useMount(() => {
		const trialAuth = {
			kubeconfigEncoded: "trial",
			appToken: "trial",
			regionUrl: "trial",
		};
		send({ type: "SET_AUTH", auth: trialAuth });
	});
}
