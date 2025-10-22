"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import * as Project from "@/components/project/project.comp";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useProjectContext } from "@/contexts/project/project.context";
import { useInstances } from "@/hooks/sealos/instance/use-instances";

export function ProjectBlock() {
	const { state, send } = useProjectContext();
	const { data: projects = [], isLoading } = useInstances();
	const [searchTerm, setSearchTerm] = useState("");

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const handleCreateProject = () => {
		// TODO: Implement project creation logic
		console.log("Create project clicked");
	};

	const handleDeleteProject = async (projectName: string) => {
		if (
			window.confirm(
				`Are you sure you want to delete project "${projectName}"? This action cannot be undone.`,
			)
		) {
			// TODO: Implement project deletion logic
			console.log("Delete project:", projectName);
		}
	};

	const filteredProjects = projects.filter((project) =>
		(project.displayName || project.name)
			.toLowerCase()
			.includes(searchTerm.toLowerCase()),
	);

	return (
		<Project.Root context={{ project: state.context, state, send }}>
			<Project.Dashboard>
				<Project.DashboardHeader>
					<Project.DashboardHeaderTitle title="Projects" />
					<div className="flex items-center gap-2">
						<Project.DashboardHeaderSearchBar
							searchValue={searchTerm}
							onSearchChange={handleSearchChange}
						/>
						<Project.DashboardHeaderNew onCreateClick={handleCreateProject} />
					</div>
				</Project.DashboardHeader>

				<Project.DashboardContent>
					{isLoading ? (
						<div className="flex flex-col items-center py-12 text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
							<p className="text-sm text-muted-foreground mt-2">
								Loading projects...
							</p>
						</div>
					) : filteredProjects.length === 0 ? (
						searchTerm ? (
							<Project.Empty type="search-empty" searchTerm={searchTerm} />
						) : (
							<Project.Empty
								type="no-projects"
								onCreateProject={handleCreateProject}
							/>
						)
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredProjects.map((project) => (
								<Project.Card
									asChild
									key={project.name}
									className="cursor-pointer"
								>
									<Link href={`/project/${project.name}`}>
										<Project.CardHeader>
											<Project.CardTitle
												displayName={project.displayName}
												name={project.name}
											/>
											<Project.CardMenu>
												<DropdownMenuItem
													onClick={() => handleDeleteProject(project.name)}
													className="text-destructive"
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</Project.CardMenu>
										</Project.CardHeader>

										<Project.CardFooter>
											<Project.CardDate date={project.createdAt} />
											<Project.CardWidget avatarUrls={[]} numPeople={0} />
										</Project.CardFooter>
									</Link>
								</Project.Card>
							))}
						</div>
					)}
				</Project.DashboardContent>
			</Project.Dashboard>
		</Project.Root>
	);
}
