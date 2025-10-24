"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "@sealos-brain/shared/misc/utils";
import type { ComponentProps } from "react";

// Content section
export const Content = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="chat-content"
			className={cn("flex-1 overflow-y-auto p-4", className)}
			{...props}
		/>
	);
};
