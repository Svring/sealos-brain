"use client";

import type { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface OverlayControlProps {
	children: ReactNode;
}

export const OverlayControl = ({
	children,
}: OverlayControlProps) => {
	return (
		<div className="relative">
			{children}

			{/* Floating control buttons overlay */}
			<div className="absolute top-2 left-2 z-50">
				<SidebarTrigger />
			</div>
		</div>
	);
};
