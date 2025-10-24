"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import { CLUSTER_ICON_BASE_URL } from "@/constants/cluster/cluster-icons.constant";
import { DEVBOX_ICON_BASE_URL } from "@/constants/devbox/devbox-icons.constant";
import { LAUNCHPAD_DEFAULT_ICON } from "@/constants/launchpad/launchpad-icons.constant";
import { OBJECTSTORAGE_DEFAULT_ICON } from "@/constants/osb/osb-icons.constant";
import type { K8sItem } from "@sealos-brain/k8s/shared/models/models/k8s-resource.model";
import type { InstanceObject } from "@sealos-brain/k8s/resources/instance/models";

interface ProjectCardViewProps {
	project: InstanceObject;
	resources?: K8sItem[];
	isLoading?: boolean;
	isError?: boolean;
}

export const ProjectCardView = ({
	project,
	resources,
}: ProjectCardViewProps) => {
	// Generate avatar data from parsed resources
	const avatarData = React.useMemo(() => {
		if (!resources?.length) return { avatarUrls: [], numPeople: 0 };

		// Group resources by type to prioritize showing different types
		const resourcesByType = resources.reduce(
			(acc, item) => {
				const type = item.resourceType;
				if (!acc[type]) acc[type] = [];
				acc[type].push(item);
				return acc;
			},
			{} as Record<string, K8sItem[]>,
		);

		// Generate icons for each resource using the same logic as node views
		const allIcons = resources
			.map((item) => {
				switch (item.resourceType) {
					case "devbox":
						// Use the same logic as DevboxNodeView
						return `${DEVBOX_ICON_BASE_URL}/${item.runtime}.svg`;
					case "cluster":
						// Use the same logic as ClusterNodeView
						return `${CLUSTER_ICON_BASE_URL}/${item.type}.svg`;
					case "deployment":
					case "statefulset":
						// Use the same logic as LaunchpadNodeView
						return LAUNCHPAD_DEFAULT_ICON;
					case "objectstorage":
						// Use the same logic as OSBNodeView
						return OBJECTSTORAGE_DEFAULT_ICON;
					default:
						return LAUNCHPAD_DEFAULT_ICON;
				}
			})
			.filter(Boolean) as string[];

		// If we have 3 or more resources, try to show different types
		if (allIcons.length >= 3) {
			const maxDisplayed = 2;
			const selectedIcons: string[] = [];
			const resourceTypes = Object.keys(resourcesByType);

			// First, try to pick one icon from each type
			for (const type of resourceTypes) {
				if (selectedIcons.length >= maxDisplayed) break;

				const typeResources = resourcesByType[type];
				if (typeResources && typeResources.length > 0) {
					const item = typeResources[0] as K8sItem;
					let iconUrl: string | null = null;

					switch (item.resourceType) {
						case "devbox":
							// Use the same logic as DevboxNodeView
							iconUrl = `${DEVBOX_ICON_BASE_URL}/${item.runtime}.svg`;
							break;
						case "cluster":
							// Use the same logic as ClusterNodeView
							iconUrl = `${CLUSTER_ICON_BASE_URL}/${item.type}.svg`;
							break;
						case "deployment":
						case "statefulset":
							// Use the same logic as LaunchpadNodeView
							iconUrl = LAUNCHPAD_DEFAULT_ICON;
							break;
						case "objectstorage":
							// Use the same logic as OSBNodeView
							iconUrl = OBJECTSTORAGE_DEFAULT_ICON;
							break;
						default:
							iconUrl = LAUNCHPAD_DEFAULT_ICON;
					}

					if (iconUrl) {
						selectedIcons.push(iconUrl);
					}
				}
			}

			// If we still have space and more resources, fill with remaining icons
			if (selectedIcons.length < maxDisplayed) {
				const remainingIcons = allIcons.filter(
					(icon) => !selectedIcons.includes(icon),
				);
				selectedIcons.push(
					...remainingIcons.slice(0, maxDisplayed - selectedIcons.length),
				);
			}

			return {
				avatarUrls: selectedIcons,
				numPeople: allIcons.length - selectedIcons.length,
			};
		}

		// For less than 3 resources, show all icons
		return {
			avatarUrls: allIcons,
			numPeople: 0,
		};
	}, [resources]);

	const commonLinkProps = {
		href: `/project/${project.name}`,
		className: "block h-full w-full",
	};

	return (
		<Link {...commonLinkProps}>
			<motion.div className="relative flex w-full cursor-pointer rounded-lg border bg-background-tertiary text-left shadow-sm min-h-[160px] flex-col p-4 py-3">
				<div className="flex items-center w-full gap-2">
					<div className="flex items-center space-x-1 min-w-0 group flex-1">
						<p className="text-foreground truncate transition-colors">
							{project.displayName}
						</p>
					</div>
				</div>
				{project.displayName !== project.name && (
					<p className="text-xs text-muted-foreground mb-2">{project.name}</p>
				)}

				<div className="absolute bottom-5 left-4 text-xs text-muted-foreground">
					{new Date(project.createdAt).toLocaleDateString()}
				</div>

				{avatarData.avatarUrls.length > 0 && (
					<div className="scale-75 origin-right absolute bottom-4 right-4">
						<AvatarCircles
							numPeople={
								avatarData.numPeople > 0 ? avatarData.numPeople : undefined
							}
							avatarUrls={avatarData.avatarUrls}
							disableLink
						/>
					</div>
				)}
			</motion.div>
		</Link>
	);
};
