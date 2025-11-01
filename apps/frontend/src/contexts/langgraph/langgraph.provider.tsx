import type React from "react";
import { LangGraphAdapter } from "./langgraph.adapter";

interface LangGraphProviderProps {
	children: React.ReactNode;
}

export function LangGraphProvider({ children }: LangGraphProviderProps) {
	return <LangGraphAdapter>{children}</LangGraphAdapter>;
}
