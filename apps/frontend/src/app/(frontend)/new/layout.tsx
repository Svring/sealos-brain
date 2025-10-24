"use client";

import { composeMetadata } from "@sealos-brain/langgraph/utils";
import type React from "react";
import { CopilotAdapter } from "@/contexts/actor/spawns/copilot/copilot.adapter";
import { useAuthState } from "@/contexts/auth/auth.context";

// import { composeMetada

interface LayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	const { auth } = useAuthState();

	return (
		<CopilotAdapter metadata={composeMetadata(auth?.kubeconfigEncoded)}>
			{children}
		</CopilotAdapter>
	);
}
