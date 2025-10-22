"use client";

import { useProjectState } from "@/contexts/project/project.context";
import { useAddChat } from "@/hooks/copilot/use-add-chat";
import { DevGroupNodeView } from "../../views/group/dev-group-node.view";

export function DevGroupNode() {
	const { project } = useProjectState();
	const { handleAddChat } = useAddChat();

	const handleClick = () => {
		handleAddChat(project?.uid);
	};

	return <DevGroupNodeView onClick={handleClick} />;
}
