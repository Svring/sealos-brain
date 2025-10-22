import type React from "react";
import { ProjectAdapter } from "./project.adapter";
import type { ProjectContext } from "./project.state";

interface ProjectProviderProps {
	children: React.ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
	// Create the project context with initial values
	const projectContext: ProjectContext = {
		project: null,
		allResources: [],
		activeResource: null,
	};

	return <ProjectAdapter projectContext={projectContext}>{children}</ProjectAdapter>;
}
