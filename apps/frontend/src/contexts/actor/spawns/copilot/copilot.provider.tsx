"use client";

import { useSelector } from "@xstate/react";
import type React from "react";
import { useCallback, useMemo } from "react";
import type { ActorRefFrom, EventFrom } from "xstate";
import { useActorSystem } from "../../actor.context";
import { copilotMachineContext } from "./copilot.context";
import type { copilotMachine } from "./copilot.state";

interface CopilotProviderProps {
	children: React.ReactNode;
}

export function CopilotProvider({ children }: CopilotProviderProps) {
	const { actorSystemRef } = useActorSystem();

	const copilotRef = useMemo(
		() =>
			actorSystemRef.system.get("copilot") as ActorRefFrom<
				typeof copilotMachine
			>,
		[actorSystemRef],
	);

	const state = useSelector(copilotRef, (s) => s);

	const send = useCallback(
		(event: EventFrom<typeof copilotMachine>) => copilotRef.send(event),
		[copilotRef],
	);

	const value = useMemo(
		() => ({
			chats: state.context.chats,
			opened: state.context.opened,
			view: state.context.view,
			state,
			send,
		}),
		[
			state.context.chats,
			state.context.opened,
			state.context.view,
			state,
			send,
		],
	);

	return (
		<copilotMachineContext.Provider value={value}>
			{children}
		</copilotMachineContext.Provider>
	);
}
