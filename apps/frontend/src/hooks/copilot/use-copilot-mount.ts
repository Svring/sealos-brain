"use client";

import { useLangGraphHealth } from "@/hooks/langgraph/use-langgraph-health";

interface UseCopilotMountProps {
	metadata: Record<string, string>;
}

export function useCopilotMount({ metadata: _metadata }: UseCopilotMountProps) {
	// Check LangGraph health
	useLangGraphHealth();
}
