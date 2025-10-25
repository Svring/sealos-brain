"use client";

import type { Message } from "@langchain/langgraph-sdk";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@sealos-brain/shared/misc/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { Children, cloneElement, isValidElement } from "react";
import Markdown from "react-markdown";
import { useCopilotAdapterContext } from "@/contexts/actor/spawns/copilot/copilot.adapter";

import "@/styles/github-markdown-dark.css";

/**
 * Message style variants for different message roles and states
 *
 * Usage examples:
 * - `messageVariants({ role: "ai", state: "loading" })` - AI message with loading animation (max-w-3xl)
 * - `messageVariants({ role: "human" })` - Human message with right alignment and background (max-w-2xl)
 * - `messageVariants({ role: "tool" })` - Tool message with neutral styling (max-w-3xl)
 * - `messageVariants({ role: "system" })` - System message with neutral styling (max-w-3xl)
 *
 * Width constraints prevent messages from occupying full row width:
 * - AI, Tool, System: max-w-3xl (768px)
 * - Human: max-w-2xl (672px) - slightly narrower for visual distinction
 */
const messageContainerVariants = cva("flex", {
	variants: {
		role: {
			ai: "justify-start",
			human: "justify-end",
			tool: "justify-start",
			system: "justify-start",
		},
	},
	defaultVariants: {
		role: "ai",
	},
});

const messageBubbleVariants = cva(
	"rounded-lg py-2 markdown-body wrap-break-word",
	{
		variants: {
			role: {
				ai: "text-foreground px-1 max-w-3xl",
				human:
					"bg-background-tertiary rounded-2xl rounded-br-md text-foreground px-4 border border-border-primary max-w-2xl",
				tool: "text-foreground px-1 max-w-3xl",
				system: "text-foreground px-1 max-w-3xl",
			},
			state: {
				loading: "animate-pulse",
				default: "",
			},
		},
		defaultVariants: {
			role: "ai",
			state: "default",
		},
	},
);

// Messages container
export const Messages = ({
	className,
	asChild = false,
	renderMessage,
	children,
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
	renderMessage?: (message: Message) => React.ReactNode;
}) => {
	const Comp = asChild ? Slot : "div";
	const { messages } = useCopilotAdapterContext();

	const availableMessageRoles = Children.toArray(children).reduce(
		(acc, child) => {
			if (isValidElement(child)) {
				const role = (child.props as { "data-message-role"?: string })[
					"data-message-role"
				];
				if (role) {
					acc[role] = child;
				}
			}
			return acc;
		},
		{} as Record<string, React.ReactNode>,
	);

	const enhancedChildren = messages.map((message) => {
		const roleComponent = availableMessageRoles[message.type];
		if (roleComponent && isValidElement(roleComponent)) {
			// Check if this is the last AI message and we have a recent human message (indicating streaming)
			const isLastMessage = message === messages[messages.length - 1];
			const isAIMessage = message.type === "ai";
			const hasRecentHumanMessage = messages.some((m) => m.type === "human");
			const inProgress =
				isLastMessage &&
				isAIMessage &&
				hasRecentHumanMessage &&
				!message.content;

			return cloneElement(roleComponent, {
				key: message.id,
				content: message.content,
				inProgress,
			} as Record<string, unknown>);
		}
		return null;
	});

	return (
		<Comp
			data-slot="chat-messages"
			className={cn("w-full h-full relative", className)}
			{...props}
		>
			<div className="max-w-3xl mx-auto h-full">
				<div className="h-full overflow-y-auto scrollbar-hide">
					{enhancedChildren}
				</div>
			</div>
		</Comp>
	);
};

// AI Message component
export const AIMessage = ({
	className,
	asChild = false,
	content,
	inProgress = false,
	...props
}: ComponentProps<"div"> &
	VariantProps<typeof messageBubbleVariants> & {
		asChild?: boolean;
		content?: string;
		inProgress?: boolean;
	}) => {
	const Comp = asChild ? Slot : "div";
	const isLoading = inProgress && !content;

	return (
		<div className={cn(messageContainerVariants({ role: "ai" }), className)}>
			<Comp
				data-slot="chat-ai-message"
				className={cn(
					messageBubbleVariants({
						role: "ai",
						state: isLoading ? "loading" : "default",
					}),
				)}
				{...props}
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
					{typeof content === "string" ? content : ""}
				</Markdown>
			</Comp>
		</div>
	);
};

// Human Message component
export const HumanMessage = ({
	className,
	asChild = false,
	content,
	...props
}: ComponentProps<"div"> &
	VariantProps<typeof messageBubbleVariants> & {
		asChild?: boolean;
		content?: string;
	}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<div className={cn(messageContainerVariants({ role: "human" }), className)}>
			<Comp
				data-slot="chat-human-message"
				className={cn(
					messageBubbleVariants({
						role: "human",
					}),
				)}
				{...props}
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
					{typeof content === "string" ? content : ""}
				</Markdown>
			</Comp>
		</div>
	);
};

// Tool Message component
export const ToolMessage = ({
	className,
	asChild = false,
	content,
	...props
}: ComponentProps<"div"> &
	VariantProps<typeof messageBubbleVariants> & {
		asChild?: boolean;
		content?: string;
	}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<div className={cn(messageContainerVariants({ role: "tool" }), className)}>
			<Comp
				data-slot="chat-tool-message"
				className={cn(
					messageBubbleVariants({
						role: "tool",
					}),
				)}
				{...props}
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
					{typeof content === "string" ? content : ""}
				</Markdown>
			</Comp>
		</div>
	);
};

// System Message component
export const SystemMessage = ({
	className,
	asChild = false,
	content,
	...props
}: ComponentProps<"div"> &
	VariantProps<typeof messageBubbleVariants> & {
		asChild?: boolean;
		content?: string;
	}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<div
			className={cn(messageContainerVariants({ role: "system" }), className)}
		>
			<Comp
				data-slot="chat-system-message"
				className={cn(
					messageBubbleVariants({
						role: "system",
					}),
				)}
				{...props}
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
					{typeof content === "string" ? content : ""}
				</Markdown>
			</Comp>
		</div>
	);
};

export { messageContainerVariants, messageBubbleVariants };
