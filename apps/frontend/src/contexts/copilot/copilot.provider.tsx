"use client";

import { useMachine } from "@xstate/react";
import type React from "react";
import { copilotMachineContext } from "./copilot.context";
import { copilotMachine } from "./copilot.state";

interface CopilotProviderProps {
	children: React.ReactNode;
}

export function CopilotProvider({ children }: CopilotProviderProps) {
	const [state, send] = useMachine(copilotMachine);

	return (
		<copilotMachineContext.Provider
			value={{
				chats: state.context.chats,
				opened: state.context.opened,
				view: state.context.view,
				state,
				send,
			}}
		>
			{children}
		</copilotMachineContext.Provider>
	);
}
