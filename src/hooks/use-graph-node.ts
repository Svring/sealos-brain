import type { Node } from "@xyflow/react";
import { useMemo } from "react";
import { hasEdgesInGraph } from "@/hooks/use-graph-edge";
import { useResources } from "@/hooks/use-resources";
import { useGraphQuery } from "@/lib/graph/graph-query";
import {
  calculateGridPosition,
  createEmptyStateNode,
  createResourceNode,
} from "@/lib/graph/graph-utils";
import type { User } from "@/payload-types";
import { useSealosStore } from "@/store/sealos-store";

interface UseGraphNodeReturn {
  nodes: Node[];
  isLoading: boolean;
}

/**
 * Hook for creating ReactFlow nodes for a specific graph
 * Used only by useGraphSpecific for ReactFlow visualization
 * Does not handle overview mode or graph management
 */
export function useGraphNode(graphName: string): UseGraphNodeReturn {
  const { currentUser } = useSealosStore();

  // Get specific graph data
  const { data: specificGraph = {}, isLoading } = useGraphQuery(
    currentUser,
    graphName
  );

  // Get resources for node data
  const { allResources } = useResources(currentUser as User);

  // Check if edges exist for this graph
  const edgesExist = hasEdgesInGraph(allResources, graphName);

  // Create ReactFlow nodes for the specific graph
  const nodes = useMemo(() => {
    const graphResources = specificGraph;

    if (!graphResources || Object.keys(graphResources).length === 0) {
      return [createEmptyStateNode(graphName)];
    }

    // Flatten all resources into a single array with their types
    const flattenedResources = Object.entries(graphResources).flatMap(
      ([resourceKind, resourceNames]) =>
        (resourceNames as string[]).map((resourceName) => ({
          kind: resourceKind,
          name: resourceName,
        }))
    );

    return flattenedResources.map((resource, index) => {
      if (edgesExist) {
        // If edges exist, position nodes at origin to let layout algorithm handle positioning
        return createResourceNode(
          resource.kind,
          resource.name,
          0,
          0,
          allResources
        );
      }
      // If no edges exist, spread nodes evenly in a grid
      const position = calculateGridPosition(index, flattenedResources.length);
      return createResourceNode(
        resource.kind,
        resource.name,
        position.x,
        position.y,
        allResources
      );
    });
  }, [graphName, specificGraph, edgesExist, allResources]);

  return {
    nodes,
    isLoading,
  };
}
