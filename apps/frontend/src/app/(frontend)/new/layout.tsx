"use client";

import type React from "react";
import { useAuthState } from "@/contexts/auth/auth.context";
import { CopilotAdapter } from "@/contexts/copilot/copilot.adapter";
import { composeMetadata } from "@/lib/langgraph/langgraph.utils";

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
