"use client";

import { Slot } from "@radix-ui/react-slot";
import { SendHorizonal } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

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
			className={cn(
				"flex items-center justify-between p-2",
				className,
			)}
			{...props}
		/>
	);
};

// TextArea component
export const TextArea = ({
	className,
	asChild = false,
	placeholder = "",
	value,
	onChange,
	onKeyDown,
	disabled = false,
	...props
}: ComponentProps<"textarea"> & {
	asChild?: boolean;
	placeholder?: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
	disabled?: boolean;
}) => {
	const Comp = asChild ? Slot : "textarea";

	return (
		<div className="flex-1 relative">
			<Comp
				className={cn(
					"flex min-h-[44px] w-full resize-none rounded-md border-none bg-transparent px-3 py-2.5 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
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
	onClick,
	disabled = false,
	canSend = false,
	...props
}: ComponentProps<"button"> & {
	asChild?: boolean;
	onClick: () => void;
	disabled?: boolean;
	canSend?: boolean;
}) => {
	const Comp = asChild ? Slot : "button";

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
				onClick={onClick}
				disabled={disabled || !canSend}
				type="button"
				{...props}
			>
				<SendHorizonal className="h-4 w-4" />
			</Comp>
		</div>
	);
};
