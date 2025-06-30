import type { Node } from "@xyflow/react";
import { useMemo } from "react";
import { useDevboxNetworks } from "@/hooks/use-devbox-networks";
import { useResources } from "@/hooks/use-resources";
import { useGraphQuery } from "@/lib/graph/graph-query";
import type { ParsedEdge } from "@/lib/graph/graph-utils";
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
  networkEdges: ParsedEdge[];
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

  // Get network nodes and edges for devboxes
  const {
    networkNodes,
    networkEdges,
    isLoading: isNetworkLoading,
  } = useDevboxNetworks(devboxNames, currentUser as User);

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

    // Create resource nodes - let the layout system handle positioning
    const resourceNodes = flattenedResources.map((resource) => {
      // Always use (0, 0) position - layout system will handle proper positioning
      return createResourceNode(
        resource.kind,
        resource.name,
        0,
        0,
        allResources
      );
    });

    // Combine resource nodes with network nodes
    return [...resourceNodes, ...networkNodes];
  }, [graphName, specificGraph, allResources, networkNodes]);

  return {
    nodes,
    networkEdges,
    isLoading: isLoading || isNetworkLoading,
  };
}
