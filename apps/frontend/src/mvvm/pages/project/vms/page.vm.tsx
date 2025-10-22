"use client";

import { useState } from "react";
import { useInstances } from "@/hooks/sealos/instance/use-instances";
import { PageView } from "../views/page.view";
import { ProjectCard } from "./project-card.vm";

export const Page = () => {
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

	return (
		<PageView
			projects={filteredProjects}
			searchTerm={searchTerm}
			isLoading={isLoading}
			isError={isError}
			onSearchChange={handleSearchChange}
			onCreateProject={handleCreateProject}
			ProjectCardComponent={ProjectCard}
		/>
	);
};
