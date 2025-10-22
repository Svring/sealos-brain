"use client";

import { Plus, Search } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InstanceObject } from "@/mvvm/sealos/instance/models/instance-object.model";

interface ProjectDashboardProps {
	projects: InstanceObject[];
	searchTerm: string;
	onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onCreateProject: () => void;
	ProjectCardComponent: React.ComponentType<{
		project: InstanceObject;
	}>;
	className?: string;
}

export const ProjectDashboardView = ({
	projects,
	searchTerm,
	onSearchChange,
	onCreateProject,
	ProjectCardComponent,
	className,
}: ProjectDashboardProps) => {
	return (
		<div
			className={`flex h-full w-full flex-col items-center p-8 ${className || ""}`}
		>
			{/* Header */}
			<div className="mb-6 w-full max-w-4xl flex items-center justify-between">
				<h1 className="text-lg font-semibold">Projects</h1>
				<div className="flex items-center gap-2">
					{/* Search */}
					<div className="relative">
						<Input
							className="h-8 w-36 pl-8 bg-background-tertiary"
							placeholder="Search..."
							value={searchTerm}
							onChange={onSearchChange}
						/>
						<Search
							className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
							size={16}
						/>
					</div>
					{/* Create Button */}
					<Button
						size="sm"
						variant="outline"
						onClick={onCreateProject}
						className="h-8 w-8 p-0 bg-background-tertiary"
					>
						<Plus size={16} />
					</Button>
				</div>
			</div>

			{/* Projects Grid */}
			<div className="w-full max-w-4xl">
				{projects.length === 0 ? (
					searchTerm ? (
						<div className="flex flex-col items-center py-12 text-center">
							<h3 className="text-lg font-medium text-muted-foreground mb-2">
								No projects found
							</h3>
							<p className="text-sm text-muted-foreground">
								No projects match "{searchTerm}". Try a different search term.
							</p>
						</div>
					) : (
						<div className="flex flex-col items-center py-12 text-center">
							<h3 className="text-lg font-medium text-muted-foreground mb-2">
								No projects yet
							</h3>
							<p className="text-sm text-muted-foreground mb-4">
								Create your first project to get started.
							</p>
							<Button onClick={onCreateProject}>
								<Plus className="h-4 w-4 mr-2" />
								Create Project
							</Button>
						</div>
					)
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{projects.map((project) => (
							<ProjectCardComponent key={project.name} project={project} />
						))}
					</div>
				)}
			</div>
		</div>
	);
};
