"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "@sealos-brain/shared/misc/utils";
import { SendHorizonal } from "lucide-react";
import type { ComponentProps } from "react";
import { useChatInput } from "@/components/copilot/chat.comp";

// Footer section
export const Footer = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="chat-footer"
			className={cn("flex items-center justify-between p-2", className)}
			{...props}
		/>
	);
};

// TextArea component
export const TextArea = ({
	className,
	asChild = false,
	placeholder = "",
	onKeyDown,
	disabled = false,
	...props
}: ComponentProps<"textarea"> & {
	asChild?: boolean;
	placeholder?: string;
	onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
	disabled?: boolean;
}) => {
	const Comp = asChild ? Slot : "textarea";
	const { value, setValue } = useChatInput();

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setValue(e.target.value);
	};

	return (
		<div className="flex-1 relative">
			<Comp
				className={cn(
					"flex min-h-[44px] w-full resize-none rounded-md border-none bg-transparent px-3 py-2.5 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				placeholder={placeholder}
				value={value}
				onChange={handleChange}
				onKeyDown={onKeyDown}
				disabled={disabled}
				rows={1}
				{...props}
			/>
		</div>
	);
};

// Send button component
export const Send = ({
	className,
	asChild = false,
	onSend,
	disabled = false,
	...props
}: ComponentProps<"button"> & {
	asChild?: boolean;
	onSend: (messages: { type: "human"; content: string }[]) => void;
	disabled?: boolean;
}) => {
	const Comp = asChild ? Slot : "button";
	const { value, getValue } = useChatInput();
	const canSend = !!value.trim();

	const handleClick = () => {
		const currentValue = getValue();
		if (currentValue.trim()) {
			onSend([{ type: "human", content: currentValue }]);
		}
	};

	return (
		<div className="flex items-end justify-end gap-2 p-0 mt-auto">
			<Comp
				className={cn(
					"h-9 w-9 rounded-lg transition-all duration-100 inline-flex items-center justify-center font-medium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border",
					canSend
						? "bg-foreground text-background-secondary hover:bg-foreground/80 cursor-pointer"
						: "bg-transparent cursor-not-allowed text-foreground",
					className,
				)}
				onClick={handleClick}
				disabled={disabled || !canSend}
				type="button"
				{...props}
			>
				<SendHorizonal className="h-4 w-4" />
			</Comp>
		</div>
	);
};
