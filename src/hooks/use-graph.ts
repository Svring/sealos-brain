import { useCallback, useMemo } from "react";
import { useGraphEdge } from "@/hooks/use-graph-edge";
import { useGraphNode } from "@/hooks/use-graph-node";
import type { ResourceType } from "@/lib/sealos/k8s/k8s-utils";
import type { User } from "@/payload-types";
import { useSealosStore } from "@/store/sealos-store";

export function useGraph(specificGraphName?: string) {
  const { currentUser } = useSealosStore();

  // Core node-related logic
  const nodeLogic = useGraphNode(specificGraphName);

  // Edge-related logic
  const edgeLogic = useGraphEdge(currentUser, specificGraphName);

  // Combine node data and edge-handling to create enhanced nodes
  const enhancedNodes = useMemo(() => {
    if (!edgeLogic.editMode) {
      return nodeLogic.nodes;
    }

    return nodeLogic.nodes.map((node) => ({
      ...node,
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
    nodeLogic.nodes,
    edgeLogic.editMode,
    edgeLogic.selectedNodes,
    edgeLogic.handleNodeClick,
  ]);

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

  return {
    // Node data
    ...nodeLogic,

    // Edge data & functions
    editMode: edgeLogic.editMode,
    setEditMode: edgeLogic.setEditMode,
    selectedNodes: edgeLogic.selectedNodes,
    pendingEdges: edgeLogic.pendingEdges,
    parsedEdges: edgeLogic.parsedEdges,
    handleNodeClick: edgeLogic.handleNodeClick,
    handleApplyConnections,
    handleQuitEditMode: edgeLogic.handleQuitEditMode,
    isApplyingConnections: edgeLogic.isApplyingConnections,
    isLoadingEdges: edgeLogic.isLoadingEdges,

    // Enhanced nodes for rendering
    enhancedNodes,
  };
}
