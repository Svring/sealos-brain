"use client";

import type React from "react";
import type { InstanceObject } from "@sealos-brain/k8s/resources/instance/models";
import { OverlayControl } from "./overlay-control.view";
import { ProjectDashboardView } from "./project-dashboard.view";

interface PageViewProps {
	projects: InstanceObject[];
	searchTerm: string;
	isLoading: boolean;
	isError: boolean;
	onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onCreateProject: () => void;
	ProjectCardComponent: React.ComponentType<{
		project: InstanceObject;
	}>;
}

export const PageView = ({
	projects,
	searchTerm,
	isLoading,
	isError,
	onSearchChange,
	onCreateProject,
	ProjectCardComponent,
}: PageViewProps) => {
	if (isLoading) {
		return null;
	}

	if (isError) {
		return null;
	}

	return (
		<div className="h-full w-full flex flex-col overflow-hidden">
			<OverlayControl>
				<ProjectDashboardView
					projects={projects}
					searchTerm={searchTerm}
					onSearchChange={onSearchChange}
					onCreateProject={onCreateProject}
					ProjectCardComponent={ProjectCardComponent}
				/>
			</OverlayControl>
		</div>
	);
};
