"use client";

import type { Edge, Node } from "@xyflow/react";
import { useProjectState } from "@/contexts/actor/spawns/project/project.context";
import { useAddChat } from "@/hooks/copilot/use-add-chat";
import { ProjectFlowView } from "../views/project-flow.view";

interface ProjectFlowProps {
	nodes?: Node[];
	edges?: Edge[];
}

export function ProjectFlow({ nodes = [], edges = [] }: ProjectFlowProps) {
	const { project } = useProjectState();
	const { handleAddChat } = useAddChat();

	const handlePaneClick = () => {
		handleAddChat(project?.uid);
	};

	const handleEdgeClick = (event: React.MouseEvent) => {
		// TODO: Implement edge click logic
		console.log(event);
	};

	return (
		<ProjectFlowView
			nodes={nodes}
			edges={edges}
			onPaneClick={handlePaneClick}
			onEdgeClick={handleEdgeClick}
		/>
	);
}
