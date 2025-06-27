import { useQueryClient } from "@tanstack/react-query";
import { type Node, type NodeChange, useNodesState } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useGraphEdge } from "@/hooks/use-graph-edge";
import { useGraphLayout } from "@/hooks/use-graph-layout";
import { useGraphNode } from "@/hooks/use-graph-node";
import { useAddResourceToGraphMutation } from "@/lib/graph/graph-mutation";
import type { ResourceType } from "@/lib/sealos/k8s/k8s-constant";
import type { User } from "@/payload-types";
import { useSealosStore } from "@/store/sealos-store";

export function useGraph(specificGraphName?: string) {
  const { currentUser } = useSealosStore();

  // React Query client for cache operations
  const queryClient = useQueryClient();

  // Core node-related logic
  const nodeLogic = useGraphNode(specificGraphName);

  // Node state management
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);

  // Track if nodes have been initialized to prevent unnecessary updates
  const nodesInitializedRef = useRef(false);
  const previousNodeCountRef = useRef(0);

  // Sync nodes from nodeLogic only when they actually change
  useEffect(() => {
    const currentNodeCount = nodeLogic.nodes.length;

    // Initialize nodes if not done yet
    if (!nodesInitializedRef.current && currentNodeCount > 0) {
      setNodes(nodeLogic.nodes);
      nodesInitializedRef.current = true;
      previousNodeCountRef.current = currentNodeCount;
    }
    // Update nodes only if count changes (indicating actual data change)
    else if (
      nodesInitializedRef.current &&
      currentNodeCount !== previousNodeCountRef.current
    ) {
      setNodes(nodeLogic.nodes);
      previousNodeCountRef.current = currentNodeCount;
    }
    // Special case: if we had nodes but now have none (e.g., all deleted)
    else if (
      nodesInitializedRef.current &&
      currentNodeCount === 0 &&
      previousNodeCountRef.current > 0
    ) {
      setNodes(nodeLogic.nodes);
      previousNodeCountRef.current = 0;
    }
  }, [nodeLogic.nodes, setNodes]);

  // Edge-related logic
  const edgeLogic = useGraphEdge(currentUser, specificGraphName);

  // Layout logic
  const { applyLayout } = useGraphLayout();

  // Mutation to rename graph (patch annotations)
  const addToGraphMutation = useAddResourceToGraphMutation();

  // Combine node data and edge-handling to create enhanced nodes
  const enhancedNodes = useMemo(() => {
    if (!edgeLogic.editMode) {
      // When not in edit mode, set draggable: false for all nodes
      return nodes.map((node) => ({
        ...node,
        draggable: false,
      }));
    }

    return nodes.map((node) => ({
      ...node,
      draggable: node.id !== "empty-state",
      data: {
        ...node.data,
        onClick: (event: React.MouseEvent) =>
          edgeLogic.handleNodeClick(event, node.id),
        isSelected: edgeLogic.selectedNodes.includes(node.id),
      },
      style: {
        ...node.style,
        border: edgeLogic.selectedNodes.includes(node.id)
          ? "1px solid white"
          : undefined,
        borderRadius: edgeLogic.selectedNodes.includes(node.id)
          ? "8px"
          : undefined,
      },
    }));
  }, [
    nodes,
    edgeLogic.editMode,
    edgeLogic.selectedNodes,
    edgeLogic.handleNodeClick,
  ]);

  // Create enhanced edges with click handlers in edit mode
  const enhancedEdges = useMemo(() => {
    if (!edgeLogic.editMode) {
      return edgeLogic.parsedEdges;
    }

    return edgeLogic.parsedEdges.map((edge) => ({
      ...edge,
      data: {
        ...edge.data,
        onClick: (event: React.MouseEvent) =>
          edgeLogic.handleEdgeClick(event, edge),
      },
    }));
  }, [edgeLogic.editMode, edgeLogic.parsedEdges, edgeLogic.handleEdgeClick]);

  // Helper to parse resource info from nodeId for edge annotations
  const getResourceInfo = useCallback((nodeId: string) => {
    const parts = nodeId.split("-");
    if (parts.length < 2) {
      return null;
    }
    const resourceType = parts[0] as ResourceType;
    const resourceName = parts.slice(1).join("-");
    return { type: resourceType, name: resourceName };
  }, []);

  // Wrap handleApplyConnections to supply current user and resource parser
  const handleApplyConnections = useCallback(async () => {
    if (!currentUser) {
      return;
    }
    await edgeLogic.handleApplyConnections(
      currentUser as User,
      getResourceInfo
    );
  }, [currentUser, edgeLogic, getResourceInfo]);

  // Apply layout to nodes and edges
  const handleApplyLayout = useCallback(
    (direction: "TB" | "LR" | "BT" | "RL" = "TB") => {
      const layouted = applyLayout(enhancedNodes, enhancedEdges, direction);

      // Update node positions with the layouted positions
      setNodes(layouted.nodes);
    },
    [applyLayout, enhancedNodes, enhancedEdges, setNodes]
  );

  // Mutation to rename graph (patch annotations)
  const renameGraph = useCallback(
    async (newName: string) => {
      const resources = nodeLogic.mergedGraphs[specificGraphName ?? ""];
      if (!(resources && currentUser)) {
        return;
      }

      const mutations: Promise<unknown>[] = [];
      for (const [kind, names] of Object.entries(resources)) {
        for (const name of names) {
          mutations.push(
            addToGraphMutation.mutateAsync({
              currentUser,
              resourceType: kind as ResourceType,
              resourceName: name,
              graphName: newName,
            })
          );
        }
      }

      // Wait for all rename mutations to finish
      await Promise.all(mutations);

      // Invalidate cached k8s data so UI reflects the renamed graph
      queryClient.invalidateQueries({ queryKey: ["k8s", "direct"] });
    },
    [
      nodeLogic.mergedGraphs,
      specificGraphName,
      currentUser,
      addToGraphMutation,
      queryClient,
    ]
  );

  return {
    // Node data
    nodes,
    setNodes,
    onNodesChange,
    isLoading: nodeLogic.isLoading,
    error: nodeLogic.error,
    mergedGraphs: nodeLogic.mergedGraphs,
    deleteGraph: nodeLogic.deleteGraph,
    isDeletingGraph: nodeLogic.isDeletingGraph,

    // Edge data & functions
    editMode: edgeLogic.editMode,
    setEditMode: edgeLogic.setEditMode,
    selectedNodes: edgeLogic.selectedNodes,
    selectedEdges: edgeLogic.selectedEdges,
    pendingEdges: edgeLogic.pendingEdges,
    pendingEdgeDeletions: edgeLogic.pendingEdgeDeletions,
    parsedEdges: enhancedEdges, // Use enhanced edges instead of raw ones
    handleNodeClick: edgeLogic.handleNodeClick,
    handleEdgeClick: edgeLogic.handleEdgeClick,
    handleApplyConnections,
    handleQuitEditMode: edgeLogic.handleQuitEditMode,
    isApplyingConnections: edgeLogic.isApplyingConnections,
    isLoadingEdges: edgeLogic.isLoadingEdges,

    // Layout functions
    handleApplyLayout,

    // Enhanced nodes for rendering
    enhancedNodes,

    // Mutation to rename graph (patch annotations)
    renameGraph,
  };
}
