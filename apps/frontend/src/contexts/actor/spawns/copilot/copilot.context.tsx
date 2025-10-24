"use client";

import { createContext, use, useCallback } from "react";
import type { EventFrom, StateFrom } from "xstate";
import type { Chat, copilotMachine, View } from "./copilot.state";

interface CopilotMachineContextValue {
	chats: Chat[];
	opened: boolean;
	view: View;
	state: StateFrom<typeof copilotMachine>;
	send: (event: EventFrom<typeof copilotMachine>) => void;
}

export const copilotMachineContext = createContext<
	CopilotMachineContextValue | undefined
>(undefined);

export function useCopilotMachineContext() {
	const ctx = use(copilotMachineContext);
	if (!ctx) {
		throw new Error(
			"useCopilotMachineContext must be used within a CopilotMachineProvider",
		);
	}
	return ctx;
}

export function useCopilotState() {
	const { state } = useCopilotMachineContext();

	return {
		chats: state.context.chats,
		opened: state.context.opened,
		view: state.context.view,
		isIdle: state.matches("idle"),
	};
}

export function useCopilotEvents() {
	const { send } = useCopilotMachineContext();

	return {
		open: useCallback(() => send({ type: "OPEN_COPILOT" }), [send]),
		close: useCallback(() => send({ type: "CLOSE_COPILOT" }), [send]),
		addChat: useCallback(
			(chat: Chat) => send({ type: "ADD_CHAT", chat }),
			[send],
		),
		setView: useCallback(
			(viewType: "chat" | "info") => send({ type: "SET_VIEW_TYPE", viewType }),
			[send],
		),
	};
}
