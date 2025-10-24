"use client";

import { isEqual } from "lodash";
import { assign, createMachine } from "xstate";

// Chat object interface
export interface Chat {
	metadata: Record<string, string>;
}

// View object interface
export interface View {
	type: "chat" | "info";
}

// Copilot context interface
export interface CopilotContext {
	chats: Chat[];
	opened: boolean;
	view: View;
}

export type CopilotEvent =
	| { type: "ADD_CHAT"; chat: Chat }
	| { type: "OPEN_COPILOT" }
	| { type: "CLOSE_COPILOT" }
	| { type: "SET_VIEW_TYPE"; viewType: "chat" | "info" }
	| { type: "NOOP" };

export const copilotMachine = createMachine({
	types: {} as {
		context: CopilotContext;
		events: CopilotEvent;
	},
	id: "copilot",
	initial: "idle",
	context: {
		chats: [],
		opened: false,
		view: { type: "chat" },
	},
	states: {
		idle: {
			on: {
				ADD_CHAT: {
					actions: assign(({ context, event }) => {
						const latestChat = context.chats[context.chats.length - 1];
						const isSameChat =
							latestChat && isEqual(latestChat.metadata, event.chat.metadata);

						return isSameChat
							? { ...context, opened: false }
							: {
									...context,
									chats: [...context.chats, event.chat],
									opened: true,
								};
					}),
				},
				OPEN_COPILOT: {
					actions: assign({ opened: true }),
				},
				CLOSE_COPILOT: {
					actions: assign({ opened: false }),
				},
				SET_VIEW_TYPE: {
					actions: assign({
						view: ({ event }) => ({ type: event.viewType }),
					}),
				},
			},
		},
	},
});
