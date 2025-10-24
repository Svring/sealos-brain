"use client";

import { k8sParser } from "@sealos-brain/lib/k8s-parser";
import { useInstanceResources } from "@/hooks/sealos/instance/use-instance-resources";
import type { CustomResourceTarget } from "@sealos-brain/k8s/shared/models/models/k8s-custom.model";
import type { InstanceObject } from "@sealos-brain/k8s/resources/instance/models";
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
