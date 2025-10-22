"use client";

import { useMount } from "@reactuses/core";
import { useLangGraphEvents } from "@/contexts/langgraph/langgraph.context";
import { useLangGraphHealth } from "@/hooks/langgraph/use-langgraph-health";

interface UseCopilotMountProps {
	metadata: Record<string, string>;
}

export function useCopilotMount({ metadata }: UseCopilotMountProps) {
	const { setRoute } = useLangGraphEvents();

	// Check LangGraph health
	useLangGraphHealth();

	// Set route based on metadata content on mount
	useMount(() => {
		const route = metadata.resourceId
			? "resourceNode"
			: metadata.projectId
				? "projectNode"
				: metadata.kubeconfigEncoded
					? "proposeNode"
					: null;
		if (route) setRoute(route);
	});
}
