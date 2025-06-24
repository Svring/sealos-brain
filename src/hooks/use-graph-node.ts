import { useEffect, useMemo } from "react";
import {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
  EdgeChange,
  NodeChange,
} from "@xyflow/react";
import { useQueryClient } from "@tanstack/react-query";
import { useSealosStore } from "@/store/sealos-store";
import { useResources, type ExistingResource } from "@/hooks/use-resources";
import { type GraphResourceGroup } from "@/lib/sealos/k8s/k8s-transform";
import { useDeleteGraphMutation } from "@/lib/sealos/k8s/k8s-mutation";

interface UseGraphNodeReturn {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  isLoading: boolean;
  error: string | null;
  mergedGraphs: GraphResourceGroup;
  deleteGraph: (graphName: string) => Promise<void>;
  isDeletingGraph: boolean;
}

export function useGraphNode(specificGraphName?: string): UseGraphNodeReturn {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { currentUser } = useSealosStore();

  // Use the simplified resources hook
  const { allResources, isLoading } = useResources(currentUser);

  // Combined error state (simplified since useResources handles individual query errors)
  const error = null; // useResources doesn't expose individual errors, but handles them internally

  // Create merged graph list from the resources
  const mergedGraphs = useMemo(() => {
    if (isLoading || !allResources.length) return {};

    const graphGroups: GraphResourceGroup = {};

    // Group resources by their graphName annotation
    allResources.forEach((resource) => {
      const graphName = resource.annotations?.graphName;
      if (graphName) {
        if (!graphGroups[graphName]) {
          graphGroups[graphName] = {};
        }
        if (!graphGroups[graphName][resource.type]) {
          graphGroups[graphName][resource.type] = [];
        }
        graphGroups[graphName][resource.type].push(resource.name);
      }
    });

    return graphGroups;
  }, [allResources, isLoading]);

  // Transform graphs into nodes and edges for visualization
  useEffect(() => {
    const allNodes: Node[] = [];
    const allEdges: Edge[] = [];

    // If specificGraphName is provided, show only that graph's resources
    if (specificGraphName) {
      const graphResources = mergedGraphs[specificGraphName];

      // If the specific graph doesn't exist or is empty (e.g., "new-graph"), show empty state node
      if (!graphResources || Object.keys(graphResources).length === 0) {
        const emptyStateNode: Node = {
          id: "empty-state",
          type: "empty-state",
          position: { x: 0, y: 0 }, // Center of the graph
          data: {
            graphName: specificGraphName,
          },
          draggable: false,
          selectable: false,
        };
        setNodes([emptyStateNode]);
        setEdges([]);
        return;
      }

      let xOffset = 300;
      let yOffset = 200;

      // Create nodes for each resource type in the specific graph
      Object.entries(graphResources).forEach(
        ([resourceKind, resourceNames], resourceTypeIndex) => {
          resourceNames.forEach((resourceName, resourceIndex) => {
            const nodeId = `${resourceKind}-${resourceName}`;
            const position = {
              x: xOffset + resourceTypeIndex * 400,
              y: yOffset + resourceIndex * 150,
            };

            // Create node based on resource type with proper data structure
            const node: Node = {
              id: nodeId,
              type: resourceKind, // Use resource kind as node type
              position,
              data: getNodeDataForResourceType(
                resourceKind,
                resourceName,
                nodeId,
                allResources
              ),
            };

            allNodes.push(node);
          });
        }
      );
    } else {
      // Show all graphs as a high-level overview
      if (!mergedGraphs || Object.keys(mergedGraphs).length === 0) {
        // No graphs exist, show empty state
        const emptyStateNode: Node = {
          id: "empty-state",
          type: "empty-state",
          position: { x: 0, y: 0 },
          data: {
            graphName: "overview",
          },
          draggable: false,
          selectable: false,
        };
        setNodes([emptyStateNode]);
        setEdges([]);
        return;
      }

      let graphIndex = 0;

      Object.entries(mergedGraphs).forEach(([graphName, graphResources]) => {
        const totalResources = Object.values(graphResources).reduce(
          (acc, resourceList) => acc + resourceList.length,
          0
        );

        // Create a graph summary node
        const graphNode: Node = {
          id: `graph-${graphName}`,
          type: "graph", // You'll need to create this node type
          position: {
            x: 300 + (graphIndex % 3) * 400,
            y: 200 + Math.floor(graphIndex / 3) * 300,
          },
          data: {
            id: `graph-${graphName}`,
            graphName,
            totalResources,
            resourceTypes: Object.keys(graphResources),
            resources: graphResources,
          },
        };

        allNodes.push(graphNode);

        // Create resource type nodes for each graph
        let resourceTypeIndex = 0;
        Object.entries(graphResources).forEach(
          ([resourceKind, resourceNames]) => {
            const resourceTypeNodeId = `${graphName}-${resourceKind}`;
            const resourceTypeNode: Node = {
              id: resourceTypeNodeId,
              type: resourceKind,
              position: {
                x: 100 + (graphIndex % 3) * 400 + resourceTypeIndex * 100,
                y: 350 + Math.floor(graphIndex / 3) * 300,
              },
              data: {
                id: resourceTypeNodeId,
                resourceKind,
                resourceNames,
                graphName,
                count: resourceNames.length,
              },
            };

            allNodes.push(resourceTypeNode);

            // Create edge from graph to resource type
            const edgeId = `${graphNode.id}-${resourceTypeNodeId}`;
            allEdges.push({
              id: edgeId,
              source: graphNode.id,
              target: resourceTypeNodeId,
              type: "step-edge",
              markerEnd: { type: MarkerType.ArrowClosed },
            } as Edge);

            resourceTypeIndex++;
          }
        );

        graphIndex++;
      });
    }

    setNodes(allNodes);
    setEdges(allEdges);
  }, [mergedGraphs, specificGraphName, setNodes, setEdges]);

  const queryClient = useQueryClient();

  // Delete graph mutation using the new mutation hook
  const deleteGraphMutation = useDeleteGraphMutation();

  const deleteGraph = async (graphName: string) => {
    const graphResources = mergedGraphs[graphName];

    if (!graphResources) {
      throw new Error(`Graph "${graphName}" not found`);
    }

    await deleteGraphMutation.mutateAsync({
      currentUser,
      graphName,
      graphResources,
    });

    // Invalidate and refetch all resource queries to update the UI
    queryClient.invalidateQueries({ queryKey: ["k8s", "direct"] });
  };

  const isDeletingGraph = deleteGraphMutation.isPending;

  return {
    nodes,
    edges,
    setNodes,
    onNodesChange,
    onEdgesChange,
    isLoading,
    error,
    mergedGraphs,
    deleteGraph,
    isDeletingGraph,
  };
}

// Helper function to get the appropriate display key for each resource type
function getResourceDisplayKey(resourceKind: string): string {
  switch (resourceKind) {
    case "devbox":
      return "devboxName";
    case "cluster":
      return "clusterName";
    case "deployment":
      return "deploymentName";
    case "cronjob":
      return "cronJobName";
    case "objectstoragebucket":
      return "bucketName";
    default:
      return "name";
  }
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
