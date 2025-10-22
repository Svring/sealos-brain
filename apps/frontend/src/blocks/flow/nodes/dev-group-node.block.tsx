"use client";

import { GroupNode } from "@/components/flow/nodes/group-node.comp";
import { useProjectState } from "@/contexts/project/project.context";
import { useAddChat } from "@/hooks/copilot/use-add-chat";

export function DevGroupNodeBlock() {
	const { project } = useProjectState();
	const { handleAddChat } = useAddChat();

	const handleClick = () => {
		handleAddChat(project?.uid);
	};

	return (
		<GroupNode label="Dev" labelPosition="bottom-left" onClick={handleClick} />
	);
}
