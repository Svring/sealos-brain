"use client";

import { useInstanceResources } from "@/hooks/sealos/instance/use-instance-resources";
import { k8sParser } from "@/lib/k8s/k8s.parser";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s-custom.model";
import type { InstanceObject } from "@/mvvm/sealos/instance/models/instance-object.model";
import { ProjectCardView } from "../views/project-card.view";

export const ProjectCard = ({ project }: { project: InstanceObject }) => {
	// Convert InstanceObject to CustomResourceTarget for the hook
	const target = k8sParser.fromObjectToTarget(project);

	// Fetch instance resources
	const {
		data: resources,
		isLoading,
		isError,
	} = useInstanceResources(target as CustomResourceTarget);

	return (
		<ProjectCardView
			project={project}
			resources={resources}
			isLoading={isLoading}
			isError={isError}
		/>
	);
};
