import { useQueryClient } from "@tanstack/react-query";
import { type Node, type NodeChange, useNodesState } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type ExistingResource, useResources } from "@/hooks/use-resources";
import { useDeleteGraphMutation } from "@/lib/sealos/k8s/k8s-mutation";
import type { GraphResourceGroup } from "@/lib/sealos/k8s/k8s-transform";
import { GRAPH_ANNOTATION_KEY } from "@/lib/sealos/k8s/k8s-utils";
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
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  selectedNodes: string[];
  pendingEdges: { source: string; target: string }[];
  handleNodeClick: (event: React.MouseEvent, nodeId: string) => void;
  handleApplyConnections: () => void;
  handleQuitEditMode: () => void;
  enhancedNodes: Node[];
}

export function useGraphNode(specificGraphName?: string): UseGraphNodeReturn {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const { currentUser } = useSealosStore();

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [pendingEdges, setPendingEdges] = useState<
    { source: string; target: string }[]
  >([]);

  // Use the simplified resources hook
  const { allResources, isLoading } = useResources(currentUser);

  // Handle node clicks in edit mode
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, nodeId: string) => {
      if (!editMode) return;

      event.stopPropagation();

      setSelectedNodes((prev) => {
        const newSelection = [...prev];

        if (newSelection.includes(nodeId)) {
          // Remove if already selected
          return newSelection.filter((id) => id !== nodeId);
        }
        newSelection.push(nodeId);

        // If we have 2 nodes selected, create an edge and reset selection
        if (newSelection.length === 2) {
          const [source, target] = newSelection;
          // Check if this edge already exists to prevent duplicates
          setPendingEdges((prevEdges) => {
            const edgeExists = prevEdges.some(
              (edge) =>
                (edge.source === source && edge.target === target) ||
                (edge.source === target && edge.target === source)
            );
            if (edgeExists) {
              return prevEdges; // Don't add duplicate
            }
            return [...prevEdges, { source, target }];
          });
          return []; // Reset selection
        }

        return newSelection;
      });
    },
    [editMode]
  );

  // Handle applying connections
  const handleApplyConnections = useCallback(() => {
    console.log("Applying connections:", pendingEdges);
    // Reset edit mode and clear pending state
    setEditMode(false);
    setPendingEdges([]);
    setSelectedNodes([]);
  }, [pendingEdges]);

  // Handle quitting edit mode
  const handleQuitEditMode = useCallback(() => {
    setEditMode(false);
    setPendingEdges([]);
    setSelectedNodes([]);
  }, []);

  // Combined error state (simplified since useResources handles individual query errors)
  const error = null; // useResources doesn't expose individual errors, but handles them internally

  // Enhanced nodes with click handlers and selection highlighting
  const enhancedNodes = useMemo(() => {
    if (!editMode) return nodes;

    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onClick: (event: React.MouseEvent) => handleNodeClick(event, node.id),
        isSelected: selectedNodes.includes(node.id),
      },
      style: {
        ...node.style,
        border: selectedNodes.includes(node.id) ? "1px solid white" : undefined,
        borderRadius: selectedNodes.includes(node.id) ? "8px" : undefined,
      },
    }));
  }, [nodes, editMode, selectedNodes, handleNodeClick]);

  // Create merged graph list from the resources
  const mergedGraphs = useMemo(() => {
    if (isLoading || !allResources.length) return {};

    const graphGroups: GraphResourceGroup = {};

    // Group resources by their graphName annotation
    allResources.forEach((resource) => {
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
    });

    return graphGroups;
  }, [allResources, isLoading]);

  // Transform graphs into nodes for visualization
  useEffect(() => {
    const allNodes: Node[] = [];

    // If specificGraphName is provided, show only that graph's resources
    if (specificGraphName) {
      const graphResources = mergedGraphs[specificGraphName];

      // If the specific graph doesn't exist or is empty (new graphs start empty), show empty state node
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
        return;
      }

      const xOffset = 300;
      const yOffset = 200;

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

            resourceTypeIndex++;
          }
        );

        graphIndex++;
      });
    }

    setNodes(allNodes);
  }, [mergedGraphs, specificGraphName, setNodes]);

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
    setNodes,
    onNodesChange,
    isLoading,
    error,
    mergedGraphs,
    deleteGraph,
    isDeletingGraph,
    editMode,
    setEditMode,
    selectedNodes,
    pendingEdges,
    handleNodeClick,
    handleApplyConnections,
    handleQuitEditMode,
    enhancedNodes,
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
