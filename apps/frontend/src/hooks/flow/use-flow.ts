"use client";

import { useMemo } from "react";
import {
	applyLayout,
	convertObjectsToNodes,
	convertReliancesToEdges,
	createDevGroup,
	deriveNetworkNodesAndEdges,
	inferObjectsReliances,
} from "@/flow/utils/flow.utils";
import type { CustomResourceTarget } from "@sealos-brain/k8s/shared/models/models/k8s-custom.model";
import { useInstanceResources } from "../sealos/instance/use-instance-resources";
import { useResourceObjects } from "../shared/resource/use-resource-objects";

export const useFlow = (instance: CustomResourceTarget) => {
	const { data: resources } = useInstanceResources(instance);

	const { data: objects, isLoading: isLoadingObjects } = useResourceObjects(
		resources || [],
	);

	const { nodes, edges } = useMemo(() => {
		if (!objects || isLoadingObjects) return { nodes: [], edges: [] };

		const baseNodes = convertObjectsToNodes(objects);

		const reliances = inferObjectsReliances(objects);

		const baseEdges = convertReliancesToEdges(reliances, objects);

		const { nodes: networkNodes, edges: networkEdges } =
			deriveNetworkNodesAndEdges(objects);

		const groupedNodes = createDevGroup([...baseNodes, ...networkNodes]);

		const allEdges = [...baseEdges, ...networkEdges];

		const layoutedNodes = applyLayout(groupedNodes, allEdges);

		return { nodes: layoutedNodes, edges: allEdges };
	}, [objects, isLoadingObjects]);

	// console.log("useFlowNodes", { nodes, edges });

	return { nodes, edges };
};
