import type React from "react";
import { ProjectAdapter } from "./project.adapter";

interface ProjectProviderProps {
	children: React.ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
	return <ProjectAdapter>{children}</ProjectAdapter>;
}
