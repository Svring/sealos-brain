"use client";

import type { Edge, Node } from "@xyflow/react";
import { ProjectFlowView } from "../views/project-flow.view";

interface ProjectFlowProps {
	nodes?: Node[];
	edges?: Edge[];
}

export function ProjectFlow({ nodes = [], edges = [] }: ProjectFlowProps) {
	const handlePaneClick = () => {
		// TODO: Implement handle pane click logic
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
