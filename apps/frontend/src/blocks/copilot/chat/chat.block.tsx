"use client";

import { useMount } from "@reactuses/core";
import { useState } from "react";
import * as Chat from "@/components/copilot/chat.comp";
import { useCopilotAdapterContext } from "@/contexts/actor/spawns/copilot/copilot.adapter";

interface ChatBlockProps {
	metadata?: Record<string, string>;
	index?: number;
	totalChats?: number;
}

export function ChatBlock({
	metadata = {},
	index = 0,
	totalChats = 1,
}: ChatBlockProps) {
	const { submitWithContext, stop, isLoading, threadId } =
		useCopilotAdapterContext();
	const [mounted, setMounted] = useState(false);

	useMount(() => setMounted(true));

	const computedIndex = totalChats - index - 1;
	const scaleValue = 1 - computedIndex * 0.02;
	const translateValue = `${computedIndex * -3}%`;

	if (computedIndex > 1) {
		return null;
	}

	const handleSend = (messages: { type: "human"; content: string }[]) => {
		if (isLoading) {
			stop();
		} else {
			submitWithContext({ messages });
		}
	};

	return (
		<div
			className={`absolute inset-2 grid-area-[1/1] transition-all duration-150 ${
				mounted ? "opacity-100" : "opacity-0 translate-x-full"
			} [--index:${computedIndex}]`}
			data-mounted={mounted}
			style={
				{
					transform: mounted
						? `scale(${scaleValue}) translateX(${translateValue})`
						: ``,
				} as React.CSSProperties
			}
		>
			<Chat.Root metadata={metadata}>
				<Chat.Container>
					{/* Header Section */}
					<Chat.Header>
						<div className="flex items-center">
							<Chat.Title />
							<Chat.ViewToggle />
							<>{threadId}</>
						</div>

						<div className="flex items-center gap-1">
							<Chat.NewChat />
							<Chat.History />
							<Chat.Close />
						</div>
					</Chat.Header>

					{/* Content Section - Messages */}
					<Chat.Content>
						<Chat.Messages>
							<Chat.AIMessage data-message-role="ai" />
							<Chat.HumanMessage data-message-role="human" />
							<Chat.ToolMessage data-message-role="tool" />
							<Chat.SystemMessage data-message-role="system" />
						</Chat.Messages>
					</Chat.Content>

					{/* Footer Section - Input */}
					<Chat.Footer>
						<div className="rounded-lg border w-full bg-background-tertiary p-2 transition-all duration-200 focus-within:border-border-primary flex flex-col">
							<Chat.TextArea disabled={isLoading} />
							<Chat.Send onSend={handleSend} disabled={isLoading} />
						</div>
					</Chat.Footer>
				</Chat.Container>
			</Chat.Root>
		</div>
	);
}
