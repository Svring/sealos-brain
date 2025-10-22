"use client";

import { useCopilotState } from "@/contexts/copilot/copilot.context";
import { ProjectCopilotView } from "../views/project-copilot.view";

export function ProjectCopilot() {
	const { chats } = useCopilotState();

	return <ProjectCopilotView chats={chats} />;
}
