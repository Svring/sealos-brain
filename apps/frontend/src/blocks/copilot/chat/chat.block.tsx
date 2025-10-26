"use client";

import { useMount } from "@reactuses/core";
import { useState } from "react";
import * as Chat from "@/components/copilot/chat.comp";
import { useCopilotAdapterContext } from "@/contexts/actor/spawns/copilot/copilot.adapter";

interface ChatBlockProps {
	metadata?: Record<string, string>;
	invertedIndex?: number;
}

export function ChatBlock({
	metadata = {},
	invertedIndex = 0,
}: ChatBlockProps) {
	const { submitWithContext, stop, isLoading } = useCopilotAdapterContext();
	const [mounted, setMounted] = useState(false);

	useMount(() => setMounted(true));

	const scaleValue = 1 - invertedIndex * 0.02;
	const translateValue = `${invertedIndex * -3}%`;

	if (invertedIndex > 1) {
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
			} [--index:${invertedIndex}]`}
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
				<Chat.Vessel>
					{/* Header Section */}
					<Chat.Header>
						<div className="flex items-center">
							<Chat.Title />
							<Chat.ViewToggle />
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
				</Chat.Vessel>
			</Chat.Root>
		</div>
	);
}
