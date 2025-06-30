import type { Node } from "@xyflow/react";
import { useMemo } from "react";
import { useDevboxNetworks } from "@/hooks/use-devbox-networks";
import { hasEdgesInGraph } from "@/hooks/use-graph-edge";
import { useResources } from "@/hooks/use-resources";
import { useGraphQuery } from "@/lib/graph/graph-query";
import {
  createEmptyStateNode,
  createResourceNode,
} from "@/lib/graph/graph-utils";
import type { User } from "@/payload-types";
import { useSealosStore } from "@/store/sealos-store";

// Regex to match newly created graph names (graph-{7chars})
const NEWLY_CREATED_GRAPH_PATTERN = /^graph-[a-z0-9]{7}$/;

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

  // Extract devbox names from the graph
  const devboxNames = useMemo(() => {
    const devboxes = specificGraph?.devbox || [];
    return Array.isArray(devboxes) ? devboxes : [];
  }, [specificGraph]);

  // Get network nodes for devboxes
  const { networkNodes, isLoading: isNetworkLoading } = useDevboxNetworks(
    devboxNames,
    currentUser as User
  );

  // Check if edges exist for this graph
  const edgesExist = hasEdgesInGraph(allResources, graphName);

  // Create ReactFlow nodes for the specific graph
  const nodes = useMemo(() => {
    const graphResources = specificGraph;

    if (!graphResources || Object.keys(graphResources).length === 0) {
      // Only show empty state for newly created graphs
      const isNewlyCreatedGraph = NEWLY_CREATED_GRAPH_PATTERN.test(graphName);
      if (isNewlyCreatedGraph) {
        return [createEmptyStateNode(graphName)];
      }
      // For existing graphs with no resources, return empty array
      return [];
    }

    // Flatten all resources into a single array with their types
    const flattenedResources = Object.entries(graphResources).flatMap(
      ([resourceKind, resourceNames]) =>
        (resourceNames as string[]).map((resourceName) => ({
          kind: resourceKind,
          name: resourceName,
        }))
    );

    const resourceNodes = flattenedResources.map((resource, index) => {
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
      // If no edges exist, arrange nodes in a grid with four per line
      const gridCols = 4;
      const gridSpacingX = 250;
      const gridSpacingY = 180;
      const x = (index % gridCols) * gridSpacingX;
      const y = Math.floor(index / gridCols) * gridSpacingY;
      return createResourceNode(
        resource.kind,
        resource.name,
        x,
        y,
        allResources
      );
    });
    // Combine resource nodes with network nodes
    return [...resourceNodes, ...networkNodes];
  }, [graphName, specificGraph, edgesExist, allResources, networkNodes]);

  return {
    nodes,
    isLoading: isLoading || isNetworkLoading,
  };
}
