"use client";

import { useAuthState } from "@/contexts/auth/auth.context";
import { useFlowEvents } from "@/contexts/flow/flow.context";
import { useProjectState } from "@/contexts/project/project.context";
import type { ResourceTarget } from "@sealos-brain/k8s/shared/models/models/k8s.model";

interface UseNodeClickProps {
	id: string;
	resourceUid: string;
	target: ResourceTarget;
}

export function useNodeClick({ id, resourceUid, target }: UseNodeClickProps) {
	const { selectNode } = useFlowEvents();
	const { auth } = useAuthState();
	const { project, activeResource } = useProjectState();

	const handleNodeClick = () => {
		selectNode(
			id,
			{
				uid: resourceUid,
				target: target,
			},
			{
				metadata: {
					kubeconfigEncoded: auth?.kubeconfigEncoded || "",
					projectUid: project?.uid || "",
					resourceUid: activeResource?.uid || "",
				},
			},
		);
	};

	return { handleNodeClick };
}
