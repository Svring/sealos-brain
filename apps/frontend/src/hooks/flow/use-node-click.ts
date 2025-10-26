"use client";

import type { ResourceTarget } from "@sealos-brain/k8s/shared/models";
import { composeMetadata } from "@sealos-brain/langgraph/utils";
import { useFlowEvents } from "@/contexts/actor/spawns/flow/flow.context";
import { useProjectState } from "@/contexts/actor/spawns/project/project.context";
import { useAuthState } from "@/contexts/auth/auth.context";

interface UseNodeClickProps {
	id: string;
	resourceUid: string;
	target: ResourceTarget;
}

export function useNodeClick({ id, resourceUid, target }: UseNodeClickProps) {
	const { selectNode } = useFlowEvents();
	const { auth } = useAuthState();
	const { project } = useProjectState();

	const handleNodeClick = () => {
		selectNode(
			id,
			{
				uid: resourceUid,
				target: target,
			},
			{
				metadata: composeMetadata({
					kubeconfigEncoded: auth?.kubeconfigEncoded || "",
					projectUid: project?.uid || "",
					resourceUid: resourceUid || "",
					graphId:
						target.resourceType === "deployment" ||
						target.resourceType === "statefulset"
							? "launchpad"
							: target.resourceType,
				}),
			},
		);
	};

	return { handleNodeClick };
}
