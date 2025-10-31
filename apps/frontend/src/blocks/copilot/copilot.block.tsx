"use client";

import * as Chat from "@/components/copilot/chat";
import * as Copilot from "@/components/copilot/copilot.comp";
import { CopilotAdapter } from "@/contexts/actor/spawns/copilot/copilot.adapter";
import {
	useCopilotMachineContext,
	useCopilotState,
} from "@/contexts/actor/spawns/copilot/copilot.context";
import { ChatBlock } from "./chat/chat.block";

export function CopilotBlock() {
	const { state, send } = useCopilotMachineContext();
	const { chats } = useCopilotState();

	const context = {
		chats: state.context.chats,
		opened: state.context.opened,
		view: state.context.view,
		state,
		send,
	};

	// If no chats, show a single empty chatbox
	if (chats.length === 0) {
		return (
			<Copilot.Root context={context}>
				<Copilot.Content>
					<CopilotAdapter metadata={{}}>
						<ChatBlock invertedIndex={0} />
					</CopilotAdapter>
				</Copilot.Content>
			</Copilot.Root>
		);
	}

	// Render all chats with their metadata
	return (
		<Copilot.Root context={context}>
			<Copilot.Content>
				{chats.map((chat, index) => {
					const invertedIndex = chats.length - index - 1;
					if (invertedIndex === 0) {
						return (
							<CopilotAdapter key={chat.uid} metadata={chat.metadata}>
								<ChatBlock
									metadata={chat.metadata}
									invertedIndex={invertedIndex}
								/>
							</CopilotAdapter>
						);
					}
					if (invertedIndex < 2) {
						return (
							<Chat.Root key={chat.uid} metadata={chat.metadata}>
								<Chat.Vessel></Chat.Vessel>
							</Chat.Root>
						);
					}
					return null;
				})}
			</Copilot.Content>
		</Copilot.Root>
	);
}
