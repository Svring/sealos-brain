"use client";

import {
	useProjectEvents,
	useProjectState,
} from "@/contexts/project/project.context";
import { useAddChat } from "@/hooks/copilot/use-add-chat";
import type { ResourceTarget } from "@/mvvm/k8s/models/k8s.model";

interface UseNodeClickProps {
	resourceUid: string;
	target: ResourceTarget;
}

export function useNodeClick({ resourceUid, target }: UseNodeClickProps) {
	const { project } = useProjectState();
	const { setActiveResource } = useProjectEvents();
	const { handleAddChat } = useAddChat();

	const handleNodeClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (event.target !== event.currentTarget) {
			return;
		}

		if (!resourceUid) {
			console.warn("No resource ID provided for node click");
			return;
		}

		// Set the active resource
		setActiveResource({
			uid: resourceUid,
			target: target,
		});

		console.log("Active resource set:", {
			uid: resourceUid,
			target: target,
		});

		// Add chat with project and resource ID
		handleAddChat(project?.uid, resourceUid);
	};

	return { handleNodeClick };
}
