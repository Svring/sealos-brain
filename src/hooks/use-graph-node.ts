import { useQueryClient } from "@tanstack/react-query";
import { type Node, type NodeChange, useNodesState } from "@xyflow/react";
import { useEffect, useMemo } from "react";
import { type ExistingResource, useResources } from "@/hooks/use-resources";
import { useDeleteGraphMutation } from "@/lib/graph/graph-mutation";
import type { GraphResourceGroup } from "@/lib/sealos/k8s/k8s-transform";
import { GRAPH_ANNOTATION_KEY } from "@/lib/sealos/k8s/k8s-utils";
import type { User } from "@/payload-types";
import { useSealosStore } from "@/store/sealos-store";

interface UseGraphNodeReturn {
  nodes: Node[];
  setNodes: (nodes: Node[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  isLoading: boolean;
  error: string | null;
  mergedGraphs: GraphResourceGroup;
  deleteGraph: (graphName: string) => Promise<void>;
  isDeletingGraph: boolean;
}

export function useGraphNode(specificGraphName?: string): UseGraphNodeReturn {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const { currentUser } = useSealosStore();

  // Use the simplified resources hook
  const { allResources, isLoading } = useResources(currentUser);

  // Combined error state (simplified since useResources handles individual query errors)
  const error: string | null = null;

  // Create merged graph list from the resources
  const mergedGraphs = useMemo(() => {
    if (isLoading || !allResources.length) {
      return {};
    }
    return groupResourcesByGraph(allResources);
  }, [allResources, isLoading]);

  // Transform graphs into nodes for visualization
  useEffect(() => {
    const createEmptyStateNode = (graphName: string) => ({
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
      y: number
    ) => ({
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
    ) => ({
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
    ) => ({
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

    if (specificGraphName) {
      const graphResources = mergedGraphs[specificGraphName];

      if (!graphResources || Object.keys(graphResources).length === 0) {
        setNodes([createEmptyStateNode(specificGraphName)]);
        return;
      }

      const resourceNodes = Object.entries(graphResources).flatMap(
        ([resourceKind, resourceNames], resourceTypeIndex) =>
          resourceNames.map((resourceName, resourceIndex) =>
            createResourceNode(
              resourceKind,
              resourceName,
              300 + resourceTypeIndex * 400,
              200 + resourceIndex * 150
            )
          )
      );

      setNodes(resourceNodes);
    } else {
      if (!mergedGraphs || Object.keys(mergedGraphs).length === 0) {
        setNodes([createEmptyStateNode("overview")]);
        return;
      }

      const graphNodes = Object.entries(mergedGraphs).flatMap(
        ([graphName, graphResources], graphIndex) => [
          createGraphNode(graphName, graphResources, graphIndex),
          ...Object.entries(graphResources).map(
            ([resourceKind, resourceNames], resourceTypeIndex) =>
              createResourceTypeNode(
                graphName,
                resourceKind,
                resourceNames,
                graphIndex,
                resourceTypeIndex
              )
          ),
        ]
      );

      setNodes(graphNodes);
    }
  }, [mergedGraphs, specificGraphName, setNodes, allResources]);

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
    setNodes,
    onNodesChange,
    isLoading,
    error,
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

function groupResourcesByGraph(
  allResources: ExistingResource[]
): GraphResourceGroup {
  const graphGroups: GraphResourceGroup = {};
  for (const resource of allResources) {
    const graphName = resource.annotations?.[GRAPH_ANNOTATION_KEY];
    if (graphName) {
      if (!graphGroups[graphName]) {
        graphGroups[graphName] = {};
      }
      if (!graphGroups[graphName][resource.type]) {
        graphGroups[graphName][resource.type] = [];
      }
      graphGroups[graphName][resource.type].push(resource.name);
    }
  }
  return graphGroups;
}
