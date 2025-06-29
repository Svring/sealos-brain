import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useResources } from "@/hooks/use-resources";
import { useAddGraphEdgesAnnotationMutation } from "@/lib/graph/graph-mutation";
import {
  applyEdgeDiff,
  buildDisplayEdges,
  hasEdgesInGraph,
  toggle,
} from "@/lib/graph/graph-utils";
import type { ResourceType } from "@/lib/sealos/k8s/k8s-constant";
import type { User } from "@/payload-types";

// Simple state types
interface PendingEdge {
  source: string;
  target: string;
}

interface PendingEdgeDeletion {
  edgeId: string;
  sourceResourceType: ResourceType;
  sourceResourceName: string;
  targetResourceType: ResourceType;
  targetResourceName: string;
}

export function useGraphEdge(
  currentUser: User | null = null,
  specificGraphName?: string
) {
  // Simple UI state - only 5 pieces
  const [editMode, setEditMode] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [draftAdds, setDraftAdds] = useState<PendingEdge[]>([]);
  const [draftDels, setDraftDels] = useState<PendingEdgeDeletion[]>([]);

  // Dependencies
  const { allResources, isLoading } = useResources(currentUser as User);
  const addGraphEdgesMutation = useAddGraphEdgesAnnotationMutation();
  const queryClient = useQueryClient();

  // Display edges
  const parsedEdges = useMemo(
    () =>
      buildDisplayEdges(
        allResources,
        specificGraphName,
        editMode,
        selectedEdges
      ),
    [allResources, specificGraphName, editMode, selectedEdges]
  );

  // 3-liner click handlers
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, nodeId: string) => {
      if (!editMode) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      setSelectedNodes((prev) => {
        const newSelection = toggle(nodeId)(prev);
        if (newSelection.length === 2) {
          const [source, target] = newSelection;

          // Check if edge already exists in pending adds
          const pendingEdgeExists = draftAdds.some(
            (edge) =>
              (edge.source === source && edge.target === target) ||
              (edge.source === target && edge.target === source)
          );

          // Check if edge already exists in current graph
          const existingEdgeExists = parsedEdges.some(
            (edge) =>
              (edge.source === source && edge.target === target) ||
              (edge.source === target && edge.target === source)
          );

          if (!(pendingEdgeExists || existingEdgeExists)) {
            setDraftAdds((edges) => [...edges, { source, target }]);
          }
          return [];
        }
        return newSelection;
      });
    },
    [editMode, draftAdds, parsedEdges]
  );

  const handleEdgeClick = useCallback(
    (
      event: React.MouseEvent,
      edge: {
        id: string;
        sourceResourceType: ResourceType;
        sourceResourceName: string;
        targetResourceType: ResourceType;
        targetResourceName: string;
      }
    ) => {
      if (!editMode) {
        return;
      }
      event.stopPropagation();
      event.preventDefault(); // Prevent any unwanted side effects
      setSelectedEdges(toggle(edge.id));
      setDraftDels((prev) => {
        const exists = prev.some((del) => del.edgeId === edge.id);
        return exists
          ? prev.filter((del) => del.edgeId !== edge.id)
          : [
              ...prev,
              {
                edgeId: edge.id,
                sourceResourceType: edge.sourceResourceType,
                sourceResourceName: edge.sourceResourceName,
                targetResourceType: edge.targetResourceType,
                targetResourceName: edge.targetResourceName,
              },
            ];
      });
    },
    [editMode]
  );

  const handleApplyConnections = useCallback(
    async (
      user: User,
      getResourceInfo: (
        nodeId: string
      ) => { type: ResourceType; name: string } | null
    ) => {
      await applyEdgeDiff({
        draftAdds,
        draftDels,
        user,
        getInfo: getResourceInfo,
        allResources,
        addGraphEdgesMutation,
        queryClient,
      });

      // Reset all state
      setEditMode(false);
      setSelectedNodes([]);
      setSelectedEdges([]);
      setDraftAdds([]);
      setDraftDels([]);
    },
    [draftAdds, draftDels, allResources, addGraphEdgesMutation, queryClient]
  );

  const handleQuitEditMode = useCallback(() => {
    setEditMode(false);
    setSelectedNodes([]);
    setSelectedEdges([]);
    setDraftAdds([]);
    setDraftDels([]);
  }, []);

  return {
    editMode,
    setEditMode,
    selectedNodes,
    selectedEdges,
    pendingEdges: draftAdds,
    pendingEdgeDeletions: draftDels,
    parsedEdges,
    handleNodeClick,
    handleEdgeClick,
    handleApplyConnections,
    handleQuitEditMode,
    isApplyingConnections: addGraphEdgesMutation.isPending,
    isLoadingEdges: isLoading,
    hasEdges: hasEdgesInGraph(allResources, specificGraphName),
  };
}

// Re-export for compatibility
export { hasEdgesInGraph } from "@/lib/graph/graph-utils";
