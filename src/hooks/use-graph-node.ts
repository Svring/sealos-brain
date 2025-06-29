import { useQueryClient } from "@tanstack/react-query";
import type { Node } from "@xyflow/react";
import { useMemo } from "react";
import { hasEdgesInGraph } from "@/hooks/use-graph-edge";
import { type ExistingResource, useResources } from "@/hooks/use-resources";
import { useDeleteGraphMutation } from "@/lib/graph/graph-mutation";
import { useGraphQuery, useGraphsQuery } from "@/lib/graph/graph-query";
import { calculateGridPosition } from "@/lib/graph/graph-utils";
import type { GraphResourceGroup } from "@/lib/sealos/k8s/k8s-transform";
import type { User } from "@/payload-types";
import { useSealosStore } from "@/store/sealos-store";

interface UseGraphNodeReturn {
  nodes: Node[];
  isLoading: boolean;
  mergedGraphs: GraphResourceGroup;
  deleteGraph: (graphName: string) => Promise<void>;
  isDeletingGraph: boolean;
}

// Node creation helper functions
const createEmptyStateNode = (graphName: string): Node => ({
  id: "empty-state",
  type: "empty-state",
  position: { x: 0, y: 0 },
  data: { graphName },
  draggable: false,
  selectable: false,
});

const createResourceNode = (
  resourceKind: string,
  resourceName: string,
  x: number,
  y: number,
  allResources: ExistingResource[]
): Node => ({
  id: `${resourceKind}-${resourceName}`,
  type: resourceKind,
  position: { x, y },
  data: getNodeDataForResourceType(
    resourceKind,
    resourceName,
    `${resourceKind}-${resourceName}`,
    allResources
  ),
});

const createGraphNode = (
  graphName: string,
  graphResources: Record<string, string[]>,
  graphIndex: number
): Node => ({
  id: `graph-${graphName}`,
  type: "graph",
  position: {
    x: 300 + (graphIndex % 3) * 400,
    y: 200 + Math.floor(graphIndex / 3) * 300,
  },
  data: {
    id: `graph-${graphName}`,
    graphName,
    totalResources: Object.values(graphResources).reduce(
      (acc, resourceList) => acc + resourceList.length,
      0
    ),
    resourceTypes: Object.keys(graphResources),
    resources: graphResources,
  },
});

const createResourceTypeNode = (
  graphName: string,
  resourceKind: string,
  resourceNames: string[],
  graphIndex: number,
  resourceTypeIndex: number
): Node => ({
  id: `${graphName}-${resourceKind}`,
  type: resourceKind,
  position: {
    x: 100 + (graphIndex % 3) * 400 + resourceTypeIndex * 100,
    y: 350 + Math.floor(graphIndex / 3) * 300,
  },
  data: {
    id: `${graphName}-${resourceKind}`,
    resourceKind,
    resourceNames,
    graphName,
    count: resourceNames.length,
  },
});

export function useGraphNode(specificGraphName?: string): UseGraphNodeReturn {
  const { currentUser } = useSealosStore();

  // Use the graph query hooks
  const { data: mergedGraphs = {}, isLoading: isLoadingGraphs } =
    useGraphsQuery(currentUser);
  const { data: specificGraph = {}, isLoading: isLoadingSpecificGraph } =
    useGraphQuery(currentUser, specificGraphName || "");

  // Use the simplified resources hook for node data
  const { allResources } = useResources(currentUser as User);

  // Check if edges exist for this graph
  const edgesExist = hasEdgesInGraph(allResources, specificGraphName);

  // Combined loading state
  const isLoading = specificGraphName
    ? isLoadingSpecificGraph
    : isLoadingGraphs;

  // Compute nodes based on current view
  const nodes = useMemo(() => {
    // Specific graph view
    if (specificGraphName) {
      const graphResources = specificGraph;

      if (!graphResources || Object.keys(graphResources).length === 0) {
        return [createEmptyStateNode(specificGraphName)];
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
        const position = calculateGridPosition(
          index,
          flattenedResources.length
        );
        return createResourceNode(
          resource.kind,
          resource.name,
          position.x,
          position.y,
          allResources
        );
      });
    }

    // Overview mode (all graphs)
    if (!mergedGraphs || Object.keys(mergedGraphs).length === 0) {
      return [createEmptyStateNode("overview")];
    }

    return Object.entries(mergedGraphs).flatMap(
      ([graphName, graphResources], graphIndex) => [
        createGraphNode(
          graphName,
          graphResources as Record<string, string[]>,
          graphIndex
        ),
        ...Object.entries(graphResources).map(
          ([resourceKind, resourceNames], resourceTypeIndex) =>
            createResourceTypeNode(
              graphName,
              resourceKind,
              resourceNames as string[],
              graphIndex,
              resourceTypeIndex
            )
        ),
      ]
    );
  }, [
    specificGraphName,
    specificGraph,
    edgesExist,
    allResources,
    mergedGraphs,
  ]);

  const queryClient = useQueryClient();

  // Delete graph mutation using the new mutation hook
  const deleteGraphMutation = useDeleteGraphMutation();

  const deleteGraph = async (graphName: string) => {
    const graphResources = mergedGraphs[graphName];

    if (!graphResources) {
      throw new Error(`Graph "${graphName}" not found`);
    }

    await deleteGraphMutation.mutateAsync({
      currentUser: currentUser as User,
      graphName,
      graphResources,
    });

    // Invalidate and refetch all resource queries to update the UI
    queryClient.invalidateQueries({ queryKey: ["k8s", "direct"] });
  };

  const isDeletingGraph = deleteGraphMutation.isPending;

  return {
    nodes,
    isLoading,
    mergedGraphs,
    deleteGraph,
    isDeletingGraph,
  };
}

// Helper function to create proper node data structure for each resource type
function getNodeDataForResourceType(
  resourceKind: string,
  resourceName: string,
  nodeId: string,
  allResources: ExistingResource[]
) {
  // Find the actual resource data
  const resource = allResources.find(
    (r) => r.name === resourceName && r.type === resourceKind
  );

  const baseData = {
    id: nodeId,
    state: mapResourceStatus(resource?.status || "Unknown"),
  };

  switch (resourceKind) {
    case "devbox":
      return {
        ...baseData,
        devboxName: resourceName,
        iconId: "devbox",
      };

    case "cluster":
      // Use DBProvider node data structure for clusters
      return {
        ...baseData,
        dbName: resourceName,
        dbType: "cluster",
        dbVersion: "Unknown", // Would need full resource data to extract this
        replicas: 1, // Would need full resource data to extract this
      };

    case "deployment":
      // Use AppLaunchpad node data structure for deployments
      return {
        ...baseData,
        deploymentName: resourceName,
        replicas: 1, // Would need full resource data to extract this
        availableReplicas: 0, // Would need full resource data to extract this
        image: "Unknown", // Would need full resource data to extract this
      };

    case "cronjob":
      return {
        ...baseData,
        cronJobName: resourceName,
        schedule: "Unknown", // Would need full resource data to extract this
        suspend: false, // Would need full resource data to extract this
      };

    case "objectstoragebucket":
      return {
        ...baseData,
        bucketName: resourceName,
        storageClassName: "Unknown", // Would need full resource data to extract this
      };

    default:
      return {
        ...baseData,
        name: resourceName,
        resourceKind,
      };
  }
}

// Helper function to map resource status to node state
function mapResourceStatus(status: string): string {
  const statusLower = status.toLowerCase();

  if (
    statusLower.includes("running") ||
    statusLower.includes("ready") ||
    statusLower.includes("available")
  ) {
    return "Running";
  }
  if (statusLower.includes("stopped") || statusLower.includes("terminated")) {
    return "Stopped";
  }
  if (statusLower.includes("creating") || statusLower.includes("pending")) {
    return "Creating";
  }
  if (statusLower.includes("failed") || statusLower.includes("error")) {
    return "Failed";
  }

  return "Unknown";
}
