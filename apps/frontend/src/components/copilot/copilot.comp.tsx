"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "@sealos-brain/shared/misc/utils";
import type { ComponentProps } from "react";
import { copilotMachineContext } from "@/contexts/actor/spawns/copilot/copilot.context";

// Root - provides copilot context
export const Root = ({
	className,
	asChild = false,
	context,
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
	context: React.ContextType<typeof copilotMachineContext>;
}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<copilotMachineContext.Provider value={context}>
			<Comp
				data-slot="copilot-root"
				className={cn("h-full w-full", className)}
				{...props}
			/>
		</copilotMachineContext.Provider>
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
			data-slot="copilot-content"
			className={cn("h-full w-full p-2 relative", className)}
			{...props}
		/>
	);
};
