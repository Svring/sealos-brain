"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "@sealos-brain/shared/misc/utils";
import type { ComponentProps } from "react";
import { flowMachineContext } from "@/contexts/actor/spawns/flow/flow.context";

// Root container
export const Root = ({
	className,
	asChild = false,
	context,
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
	context: React.ContextType<typeof flowMachineContext>;
}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<flowMachineContext.Provider value={context}>
			<Comp
				data-slot="flow-root"
				className={cn("h-full w-full", className)}
				{...props}
			/>
		</flowMachineContext.Provider>
	);
};

// Content area
export const Content = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="flow-content"
			className={cn("h-full w-full", className)}
			{...props}
		/>
	);
};
