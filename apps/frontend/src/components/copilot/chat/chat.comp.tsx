"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "@sealos-brain/shared/misc/utils";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { createContext, useContext, useState } from "react";

// Chat Input Context
interface ChatInputContextValue {
	value: string;
	setValue: (value: string) => void;
	getValue: () => string;
	clearValue: () => void;
}

const ChatInputContext = createContext<ChatInputContextValue | undefined>(
	undefined,
);

export const useChatInput = () => {
	const context = useContext(ChatInputContext);
	if (!context) {
		throw new Error("useChatInput must be used within ChatProvider");
	}
	return context;
};

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
			<Provider>{children}</Provider>
		</Comp>
	);
};

export const Provider = ({ children }: { children: React.ReactNode }) => {
	const [value, setValue] = useState("");

	const getValue = () => value;
	const clearValue = () => setValue("");

	return (
		<ChatInputContext.Provider
			value={{ value, setValue, getValue, clearValue }}
		>
			{children}
		</ChatInputContext.Provider>
	);
};

export const Vessel = ({
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
