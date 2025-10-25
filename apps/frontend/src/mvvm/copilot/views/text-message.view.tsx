"use client";

import type { Message } from "@langchain/langgraph-sdk";
import { cn } from "@sealos-brain/shared/misc/utils";
import Markdown from "react-markdown";

import "@/styles/github-markdown-dark.css";

interface RenderTextMessageProps {
	message: Message;
	inProgress: boolean;
}

export function RenderTextMessage({
	message,
	inProgress,
}: RenderTextMessageProps) {
	const isUser = message.type === "human";
	const isLoading = inProgress && !isUser && !message.content;

	if (
		(!message.content && !isLoading) ||
		message.type === "tool" ||
		message.type === "system"
	) {
		return null;
	}

	// console.log("message", message);

	return (
		<div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
			<div
				className={cn(
					"rounded-lg py-2 markdown-body wrap-break-word",
					isUser
						? "bg-background-tertiary rounded-2xl rounded-br-md text-foreground px-4 border border-border-primary max-w-2xl"
						: "text-foreground px-1 max-w-3xl",
					isLoading && "animate-pulse",
				)}
			>
				<Markdown
					components={{
						ol: ({ children, ...props }) => (
							<ol className="list-decimal" {...props}>
								{children}
							</ol>
						),
						ul: ({ children, ...props }) => (
							<ul className="list-disc" {...props}>
								{children}
							</ul>
						),
					}}
				>
					{typeof message.content === "string" ? message.content : ""}
				</Markdown>
			</div>
		</div>
	);
}
