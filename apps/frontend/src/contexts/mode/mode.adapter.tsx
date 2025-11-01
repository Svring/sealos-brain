"use client";

import { useMount } from "@reactuses/core";
import { useMachine } from "@xstate/react";
import { createSealosApp, sealosApp } from "@zjy365/sealos-desktop-sdk/app";
import { err, ok, ResultAsync } from "neverthrow";
import type { ReactNode } from "react";
import { modeMachineContext } from "./mode.context";
import type { ModeContext } from "./mode.state";
import { modeMachine } from "./mode.state";

interface ModeAdapterProps {
	children: ReactNode;
	modeContext: ModeContext;
}

export function ModeAdapter({ children, modeContext }: ModeAdapterProps) {
	const [state, send] = useMachine(modeMachine, {
		input: modeContext,
	});

	// Check session data first, then fall back to URL check
	useMount(async () => {
		createSealosApp();
		const isSessionAvailable = await ResultAsync.fromPromise(
			sealosApp.getSession(),
			(error) => new Error(`Failed to get session: ${error}`),
		).andThen((session) => {
			if (session) {
				return ok(session);
			}
			return err(new Error("No session data available"));
		});

		if (isSessionAvailable.isOk()) {
			send({ type: "SET_PROD" });
		} else {
			send({ type: "SET_DEV" });
		}
	});

	return (
		<modeMachineContext.Provider
			value={{
				mode: state.context,
				state,
				send,
			}}
		>
			{children}
		</modeMachineContext.Provider>
	);
}
