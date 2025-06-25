import { useCallback, useState } from "react";
import { useAddGraphEdgesAnnotationMutation } from "@/lib/graph/graph-mutation";
import type { ResourceType } from "@/lib/sealos/k8s/k8s-utils";
import type { User } from "@/payload-types";

interface PendingEdge {
  source: string;
  target: string;
}

interface UseGraphEdgeReturn {
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  selectedNodes: string[];
  pendingEdges: PendingEdge[];
  handleNodeClick: (event: React.MouseEvent, nodeId: string) => void;
  handleApplyConnections: (
    currentUser: User,
    getResourceInfo: (
      nodeId: string
    ) => { type: ResourceType; name: string } | null
  ) => Promise<void>;
  handleQuitEditMode: () => void;
  isApplyingConnections: boolean;
}

export function useGraphEdge(): UseGraphEdgeReturn {
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [pendingEdges, setPendingEdges] = useState<PendingEdge[]>([]);

  // Mutation for adding graph edges annotation
  const addGraphEdgesMutation = useAddGraphEdgesAnnotationMutation();

  // Handle node clicks in edit mode
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, nodeId: string) => {
      if (!editMode) {
        return;
      }

      event.stopPropagation();
      event.preventDefault();

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
  const handleApplyConnections = useCallback(
    async (
      currentUser: User,
      getResourceInfo: (
        nodeId: string
      ) => { type: ResourceType; name: string } | null
    ) => {
      if (pendingEdges.length === 0) {
        return;
      }

      // Process all pending edges in parallel
      const edgePromises = pendingEdges.map((edge) => {
        const sourceInfo = getResourceInfo(edge.source);
        const targetInfo = getResourceInfo(edge.target);

        if (!(sourceInfo && targetInfo)) {
          // Skip invalid edges
          return Promise.resolve();
        }

        // Create edge annotation value (JSON string with edge information)
        const edgeData = {
          source: {
            nodeId: edge.source,
            resourceType: sourceInfo.type,
            resourceName: sourceInfo.name,
          },
          target: {
            nodeId: edge.target,
            resourceType: targetInfo.type,
            resourceName: targetInfo.name,
          },
          createdAt: new Date().toISOString(),
        };

        // Create reverse edge annotation
        const reverseEdgeData = {
          source: {
            nodeId: edge.target,
            resourceType: targetInfo.type,
            resourceName: targetInfo.name,
          },
          target: {
            nodeId: edge.source,
            resourceType: sourceInfo.type,
            resourceName: sourceInfo.name,
          },
          createdAt: new Date().toISOString(),
        };

        // Add both edge annotations in parallel
        return Promise.all([
          addGraphEdgesMutation.mutateAsync({
            currentUser,
            resourceType: sourceInfo.type,
            resourceName: sourceInfo.name,
            graphEdges: JSON.stringify([edgeData]),
          }),
          addGraphEdgesMutation.mutateAsync({
            currentUser,
            resourceType: targetInfo.type,
            resourceName: targetInfo.name,
            graphEdges: JSON.stringify([reverseEdgeData]),
          }),
        ]);
      });

      // Wait for all edge operations to complete
      await Promise.all(edgePromises);

      // Reset edit mode and clear pending state
      setEditMode(false);
      setPendingEdges([]);
      setSelectedNodes([]);
    },
    [pendingEdges, addGraphEdgesMutation]
  );

  // Handle quitting edit mode
  const handleQuitEditMode = useCallback(() => {
    setEditMode(false);
    setPendingEdges([]);
    setSelectedNodes([]);
  }, []);

  return {
    editMode,
    setEditMode,
    selectedNodes,
    pendingEdges,
    handleNodeClick,
    handleApplyConnections,
    handleQuitEditMode,
    isApplyingConnections: addGraphEdgesMutation.isPending,
  };
}
