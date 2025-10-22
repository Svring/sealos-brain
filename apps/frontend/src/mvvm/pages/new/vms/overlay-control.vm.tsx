"use client";

import { SquarePen } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCopilotAdapterContext } from "@/contexts/copilot/copilot.adapter";

interface OverlayControlProps {
	children: ReactNode;
}

export const OverlayControl = ({ children }: OverlayControlProps) => {
	const { createNewThread, hasMessages } = useCopilotAdapterContext();

	return (
		<div className="relative h-full w-full">
			{children}

			{/* Floating control buttons overlay */}
			<div className="absolute top-2 left-2 z-50 flex">
				<SidebarTrigger />
				{hasMessages && (
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 [&_svg]:!size-4.5 cursor-pointer"
						onClick={createNewThread}
					>
						<SquarePen className="h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	);
};
