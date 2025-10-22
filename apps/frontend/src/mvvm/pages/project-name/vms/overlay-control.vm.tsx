"use client";

import type { ReactNode } from "react";
import { useProjectState } from "@/contexts/project/project.context";
import { OverlayControlView } from "../views/overlay-control.view";

interface OverlayControlProps {
	children: ReactNode;
}

export function OverlayControl({ children }: OverlayControlProps) {
	const { project } = useProjectState();

	// If project is null, just return children without overlay controls
	if (!project) {
		return <>{children}</>;
	}

	return (
		<OverlayControlView project={project.object}>{children}</OverlayControlView>
	);
}
