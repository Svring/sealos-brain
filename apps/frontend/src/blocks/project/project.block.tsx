"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Control from "@/components/control/control.comp";
import * as Project from "@/components/project/project.comp";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useProjectContext } from "@/contexts/actor/spawns/project/project.context";
import { useInstances } from "@/hooks/sealos/instance/use-instances";

export function ProjectBlock() {
	const router = useRouter();
	const { state, send } = useProjectContext();
	const { data: projects = [], isLoading } = useInstances();
	const [searchTerm, setSearchTerm] = useState("");

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
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

	const openProject = (projectName: string) => {
		router.push(`/project/${projectName}`);
	};

	const filteredProjects = projects.filter((project) =>
		(project.displayName || project.name)
			.toLowerCase()
			.includes(searchTerm.toLowerCase()),
	);

	return (
		<Control.Root>
			<Project.Root context={{ project: state.context, state, send }}>
				<Project.Dashboard>
					<Project.DashboardHeader>
						<Project.DashboardHeaderTitle title="Projects" />
						<div className="flex items-center gap-2">
							<Project.DashboardHeaderSearchBar
								searchValue={searchTerm}
								onSearchChange={handleSearchChange}
							/>
						</div>
					</Project.DashboardHeader>

					<Project.DashboardContent>
						{isLoading ? (
							<Project.Loading message="Loading projects..." />
						) : filteredProjects.length === 0 ? (
							searchTerm ? (
								<Project.Empty type="search-empty" searchTerm={searchTerm} />
							) : (
								<Project.Empty
									type="no-projects"
									onCreateProject={() => router.push("/new")}
								/>
							)
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredProjects.map((project) => (
									<Project.Card key={project.name} className="cursor-pointer">
										<Project.CardHeader>
											<Project.CardTitle
												displayName={project.displayName}
												name={project.name}
												onClick={() => openProject(project.name)}
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

										<Project.CardFooter
											onClick={() => openProject(project.name)}
										>
											<Project.CardDate date={project.createdAt} />
											<Project.CardWidget avatarUrls={[]} numPeople={0} />
										</Project.CardFooter>
									</Project.Card>
								))}
							</div>
						)}
					</Project.DashboardContent>
				</Project.Dashboard>
			</Project.Root>

			<Control.Overlay>
				<Control.Pad className="top-2 left-2">
					<Control.SidebarTrigger />
				</Control.Pad>
			</Control.Overlay>
		</Control.Root>
	);
}
