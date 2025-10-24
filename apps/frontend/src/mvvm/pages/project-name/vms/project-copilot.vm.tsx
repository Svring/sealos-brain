"use client";

import { useCopilotState } from "@/contexts/actor/spawns/copilot/copilot.context";
import { ProjectCopilotView } from "../views/project-copilot.view";

export function ProjectCopilot() {
	const { chats } = useCopilotState();

	return <ProjectCopilotView chats={chats} />;
}
