"use client";

import { useMemo } from "react";
import {
	applyLayout,
	convertObjectsToNodes,
	convertReliancesToEdges,
	createDevGroup,
	deriveNetworkNodesAndEdges,
	inferObjectsReliances,
} from "@/lib/flow/flow.utils";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s-custom.model";
import { useResourceObjects } from "../resource/use-resource-objects";
import { useInstanceResources } from "../sealos/instance/use-instance-resources";

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
