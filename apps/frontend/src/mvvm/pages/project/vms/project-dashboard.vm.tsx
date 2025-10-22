"use client";

import { useState } from "react";
import { useInstances } from "@/hooks/sealos/instance/use-instances";
import { ProjectDashboardView } from "../views/project-dashboard.view";
import { ProjectCard } from "./project-card.vm";

export const ProjectDashboard = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const { data: instances, isLoading, isError } = useInstances();

	// Filter instances based on search term
	const filteredProjects =
		instances?.filter((instance) => {
			if (instance.displayName) {
				return instance.displayName
					.toLowerCase()
					.includes(searchTerm.toLowerCase());
			}
			return instance.name
				.toLowerCase()
				.includes(searchTerm.toLowerCase());
		}) || [];

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const handleCreateProject = () => {
		console.log("Create new project");
	};

	if (isLoading) {
		return null;
	}

	if (isError) {
		return null;
	}

	return (
		<ProjectDashboardView
			projects={filteredProjects}
			searchTerm={searchTerm}
			onSearchChange={handleSearchChange}
			onCreateProject={handleCreateProject}
			ProjectCardComponent={ProjectCard}
		/>
	);
};
