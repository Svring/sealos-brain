"use client";

import type { Message } from "@langchain/langgraph-sdk";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { Children, cloneElement, isValidElement, useMemo, useRef } from "react";
import { useCopilotAdapterContext } from "@/contexts/copilot/copilot.adapter";
import { useAutoScroll } from "@/hooks/utils/use-auto-scroll";
import { cn } from "@/lib/utils";

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
	const { messages, isLoading } = useCopilotAdapterContext();

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
			return cloneElement(roleComponent, {
				key: message.id,
				content: message.content,
			} as Record<string, unknown>);
		}
		return null;
	});

	return (
		<Comp
			data-slot="chat-messages"
			className={cn("w-full px-4 h-full relative", className)}
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
	...props
}: ComponentProps<"div"> & { 
	asChild?: boolean;
	content?: string;
}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="chat-ai-message"
			className={cn("", className)}
			{...props}
		>
			{content}
		</Comp>
	);
};

// Human Message component
export const HumanMessage = ({
	className,
	asChild = false,
	content,
	...props
}: ComponentProps<"div"> & { 
	asChild?: boolean;
	content?: string;
}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="chat-human-message"
			className={cn("", className)}
			{...props}
		>
			{content}
		</Comp>
	);
};

// Tool Message component
export const ToolMessage = ({
	className,
	asChild = false,
	content,
	...props
}: ComponentProps<"div"> & { 
	asChild?: boolean;
	content?: string;
}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="chat-tool-message"
			className={cn("", className)}
			{...props}
		>
			{content}
		</Comp>
	);
};

// System Message component
export const SystemMessage = ({
	className,
	asChild = false,
	content,
	...props
}: ComponentProps<"div"> & { 
	asChild?: boolean;
	content?: string;
}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="chat-system-message"
			className={cn("", className)}
			{...props}
		>
			{content}
		</Comp>
	);
};
