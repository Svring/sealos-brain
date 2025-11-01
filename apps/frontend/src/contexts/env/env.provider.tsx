import type React from "react";
import { EnvAdapter } from "./env.adapter";

interface EnvProviderProps {
	children: React.ReactNode;
}

export function EnvProvider({ children }: EnvProviderProps) {
	// Read environment variables (server-side)
	const langgraphDeploymentUrl = process.env.LANGGRAPH_DEPLOYMENT_URL;

	// Create the env context with variables
	const envContext = {
		variables: langgraphDeploymentUrl
			? {
					LANGGRAPH_DEPLOYMENT_URL: langgraphDeploymentUrl,
				}
			: null,
	};

	return <EnvAdapter envContext={envContext}>{children}</EnvAdapter>;
}
