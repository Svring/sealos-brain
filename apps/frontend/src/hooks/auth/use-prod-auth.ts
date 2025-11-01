"use client";

import { useMount } from "@reactuses/core";
import { createSealosApp, sealosApp } from "@zjy365/sealos-desktop-sdk/app";
import { err, ok, ResultAsync } from "neverthrow";
import { toast } from "sonner";
import type { EventFrom } from "xstate";
import type { authMachine } from "@/contexts/auth/auth.state";
import { deriveAuth } from "@/lib/auth/auth.utils";

export function useProdAuth(
	send: (event: EventFrom<typeof authMachine>) => void,
) {
	// Get session data on mount
	useMount(async () => {
		createSealosApp();
		await ResultAsync.fromPromise(
			sealosApp.getSession(),
			(error) => new Error(`Failed to get session: ${error}`),
		)
			.andThen((session) => {
				return session ? ok(session) : err(new Error("No session found"));
			})
			.andThen((session) => {
				return deriveAuth(session.kubeconfig, session.token);
			})
			.match(
				(auth) => send({ type: "SET_AUTH", auth }),
				(error) => {
					toast.error(`Failed to get session: ${error.message}`);
					send({ type: "FAIL" });
				},
			);
	});
}
