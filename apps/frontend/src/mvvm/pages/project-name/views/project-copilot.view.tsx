"use client";

import { useMount } from "@reactuses/core";
import { useState } from "react";
import { CopilotAdapter } from "@/contexts/actor/spawns/copilot/copilot.adapter";
import type { Chat } from "@/contexts/actor/spawns/copilot/copilot.state";
import { Chatbox } from "@/mvvm/copilot/vms/chatbox.vm";

interface CopilotChatProps {
	chat: Chat;
	index: number;
	totalChats: number;
}

function CopilotChat({ chat, index, totalChats }: CopilotChatProps) {
	const [mounted, setMounted] = useState(false);

	useMount(() => setMounted(true));

	const computedIndex = totalChats - index - 1;
	const scaleValue = 1 - computedIndex * 0.02;
	const translateValue = `${computedIndex * -3}%`;

	if (computedIndex > 1) {
		return null;
	}

	return (
		<div
			className={`absolute inset-2 grid-area-[1/1] transition-all duration-[0.15s] ${
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
			<CopilotAdapter metadata={chat.metadata}>
				<Chatbox />
			</CopilotAdapter>
		</div>
	);
}

interface ProjectCopilotViewProps {
	chats: Chat[];
}

export function ProjectCopilotView({ chats }: ProjectCopilotViewProps) {
	// If no chats, show a single empty chatbox
	if (chats.length === 0) {
		return (
			<div className="h-full w-full p-2">
				<CopilotAdapter metadata={{}}>
					<Chatbox />
				</CopilotAdapter>
			</div>
		);
	}

	// Render all chats with their metadata
	return (
		<div className="h-full w-full p-2 relative">
			{chats.map((chat, index) => (
				<CopilotChat
					key={index}
					chat={chat}
					index={index}
					totalChats={chats.length}
				/>
			))}
		</div>
	);
}
