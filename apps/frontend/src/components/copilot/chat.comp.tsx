"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { CopilotAdapter } from "@/contexts/copilot/copilot.adapter";
import { cn } from "@/lib/utils";

export * from "./chat/chat-content.comp";
export * from "./chat/chat-footer.comp";
// Re-export from split files
export * from "./chat/chat-header.comp";
export * from "./chat/chat-messages.comp";

const chatVariants = cva(
	"h-full w-full flex flex-col bg-background-tertiary border rounded-lg",
);

export const Root = ({
	className,
	asChild = false,
	children,
	metadata = {},
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
	metadata?: Record<string, string>;
}) => {
	const Comp = asChild ? Slot : "div";

	return (
		<Comp
			data-slot="chat-root"
			className={cn("h-full w-full", className)}
			{...props}
		>
			<CopilotAdapter metadata={metadata}>{children}</CopilotAdapter>
		</Comp>
	);
};

export const Container = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="chat-container"
			className={cn(chatVariants({ className }))}
			{...props}
		/>
	);
};
