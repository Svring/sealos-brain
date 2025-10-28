import type React from "react";
import { LangGraphAdapter } from "./langgraph.adapter";

interface LangGraphProviderProps {
	children: React.ReactNode;
}

export function LangGraphProvider({ children }: LangGraphProviderProps) {
	// Read environment variables (server-side)
	const deploymentUrl = process.env.LANGGRAPH_DEPLOYMENT_URL || "";

	// Create the LangGraph context from environment variables
	const langgraphContext = {
		deploymentUrl,
	};

	return (
		<LangGraphAdapter langgraphContext={langgraphContext}>
			{children}
		</LangGraphAdapter>
	);
}
