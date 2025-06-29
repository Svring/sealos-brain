import { useQueryClient } from "@tanstack/react-query";
import type { Edge } from "@xyflow/react";
import { useCallback, useMemo, useState } from "react";
import { type ExistingResource, useResources } from "@/hooks/use-resources";
import { useAddGraphEdgesAnnotationMutation } from "@/lib/graph/graph-mutation";
import {
  GRAPH_ANNOTATION_KEY,
  GRAPH_EDGES_ANNOTATION_KEY,
  type ResourceType,
} from "@/lib/sealos/k8s/k8s-constant";
import type { User } from "@/payload-types";

interface PendingEdge {
  source: string;
  target: string;
}

// Add interface for pending edge deletions
interface PendingEdgeDeletion {
  edgeId: string;
  sourceResourceType: ResourceType;
  sourceResourceName: string;
  targetResourceType: ResourceType;
  targetResourceName: string;
}

// ReactFlow-compatible edge interface with additional metadata
interface ParsedEdge extends Edge {
  sourceResourceType: ResourceType;
  sourceResourceName: string;
  targetResourceType: ResourceType;
  targetResourceName: string;
  createdAt: string;
}

// New edge storage format
interface EdgeConnection {
  name: string;
  type: ResourceType;
}

interface EdgeInfo {
  in: EdgeConnection[];
  out: EdgeConnection[];
}

interface UseGraphEdgeReturn {
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  selectedNodes: string[];
  selectedEdges: string[];
  pendingEdges: PendingEdge[];
  pendingEdgeDeletions: PendingEdgeDeletion[];
  parsedEdges: ParsedEdge[];
  handleNodeClick: (event: React.MouseEvent, nodeId: string) => void;
  handleEdgeClick: (event: React.MouseEvent, edge: ParsedEdge) => void;
  handleApplyConnections: (
    currentUser: User,
    getResourceInfo: (
      nodeId: string
    ) => { type: ResourceType; name: string } | null
  ) => Promise<void>;
  handleQuitEditMode: () => void;
  isApplyingConnections: boolean;
  isLoadingEdges: boolean;
  hasEdges: boolean;
}

// Helper function to create edge from connection info
function createEdgeFromConnection(
  sourceType: ResourceType,
  sourceName: string,
  targetType: ResourceType,
  targetName: string
): ParsedEdge {
  return {
    // ReactFlow Edge properties
    id: `${sourceType}-${sourceName}-to-${targetType}-${targetName}`,
    source: `${sourceType}-${sourceName}`,
    target: `${targetType}-${targetName}`,
    type: "step-edge",
    animated: true,

    // Additional metadata
    sourceResourceType: sourceType,
    sourceResourceName: sourceName,
    targetResourceType: targetType,
    targetResourceName: targetName,
    createdAt: new Date().toISOString(),
  };
}

// Helper function to process connections array
function processConnections(
  connections: EdgeConnection[],
  resourceType: ResourceType,
  resourceName: string,
  isOutgoing: boolean
): ParsedEdge[] {
  const edges: ParsedEdge[] = [];

  for (const connection of connections) {
    if (connection.name && connection.type) {
      if (isOutgoing) {
        edges.push(
          createEdgeFromConnection(
            resourceType,
            resourceName,
            connection.type,
            connection.name
          )
        );
      } else {
        edges.push(
          createEdgeFromConnection(
            connection.type,
            connection.name,
            resourceType,
            resourceName
          )
        );
      }
    }
  }

  return edges;
}

// Helper function to parse a single edge annotation with new format
function parseEdgeAnnotation(
  edgesAnnotation: string,
  resourceName: string,
  resourceType: ResourceType
): ParsedEdge[] {
  try {
    const edgeInfo: EdgeInfo = JSON.parse(edgesAnnotation);
    if (!edgeInfo || typeof edgeInfo !== "object") {
      return [];
    }

    const edges: ParsedEdge[] = [];

    // Process "out" connections (this resource connects to others)
    if (Array.isArray(edgeInfo.out)) {
      edges.push(
        ...processConnections(edgeInfo.out, resourceType, resourceName, true)
      );
    }

    // Process "in" connections (other resources connect to this one)
    // This enables bidirectional relationships - a resource can have both incoming and outgoing connections
    if (Array.isArray(edgeInfo.in)) {
      edges.push(
        ...processConnections(edgeInfo.in, resourceType, resourceName, false)
      );
    }

    return edges;
  } catch {
    // Silently ignore parsing errors
    return [];
  }
}

// Helper function to check if resource belongs to specific graph
function isResourceInGraph(
  resource: ExistingResource,
  specificGraphName?: string
): boolean {
  if (!specificGraphName) {
    return true;
  }
  const resourceGraphName = resource.annotations?.[GRAPH_ANNOTATION_KEY];
  return resourceGraphName === specificGraphName;
}

// Helper function to process edges for a single resource
function processResourceEdges(resource: ExistingResource): ParsedEdge[] {
  const edgesAnnotation = resource.annotations?.[GRAPH_EDGES_ANNOTATION_KEY];
  if (!edgesAnnotation) {
    return [];
  }

  return parseEdgeAnnotation(
    edgesAnnotation,
    resource.name,
    resource.type as ResourceType
  );
}

// Helper function to create edge info for resource
function createEdgeInfoForResource(
  resourceKey: string,
  connections: EdgeConnection[],
  isOutgoing: boolean
): { resourceType: ResourceType; resourceName: string; edgeInfo: EdgeInfo } {
  const [resourceType, ...nameParts] = resourceKey.split("-");
  const resourceName = nameParts.join("-");

  const edgeInfo: EdgeInfo = {
    in: isOutgoing ? [] : connections,
    out: isOutgoing ? connections : [],
  };

  return {
    resourceType: resourceType as ResourceType,
    resourceName,
    edgeInfo,
  };
}

// Helper function to get existing edge info for a resource
function getExistingEdgeInfo(
  resourceKey: string,
  allResources: ExistingResource[]
): EdgeInfo {
  const [resourceType, ...nameParts] = resourceKey.split("-");
  const resourceName = nameParts.join("-");

  const resource = allResources.find(
    (r) => r.type === resourceType && r.name === resourceName
  );

  if (resource?.annotations?.[GRAPH_EDGES_ANNOTATION_KEY]) {
    try {
      const existing = JSON.parse(
        resource.annotations[GRAPH_EDGES_ANNOTATION_KEY]
      );
      return {
        in: Array.isArray(existing.in) ? existing.in : [],
        out: Array.isArray(existing.out) ? existing.out : [],
      };
    } catch {
      return { in: [], out: [] };
    }
  }

  return { in: [], out: [] };
}

// Helper function to add connection if not exists
function addConnectionIfNotExists(
  connections: EdgeConnection[],
  newConnection: EdgeConnection
): void {
  const exists = connections.some(
    (conn) =>
      conn.name === newConnection.name && conn.type === newConnection.type
  );
  if (!exists) {
    connections.push(newConnection);
  }
}

// Helper function to remove connection if exists
function removeConnectionIfExists(
  connections: EdgeConnection[],
  connectionToRemove: EdgeConnection
): void {
  const index = connections.findIndex(
    (conn) =>
      conn.name === connectionToRemove.name &&
      conn.type === connectionToRemove.type
  );
  if (index !== -1) {
    connections.splice(index, 1);
  }
}

// Helper function to process a single pending edge
function processPendingEdge(
  pendingEdge: PendingEdge,
  getResourceInfo: (
    nodeId: string
  ) => { type: ResourceType; name: string } | null,
  resourceUpdates: Map<string, EdgeInfo>,
  allResources: ExistingResource[]
): void {
  const sourceInfo = getResourceInfo(pendingEdge.source);
  const targetInfo = getResourceInfo(pendingEdge.target);

  if (!(sourceInfo && targetInfo)) {
    return;
  }

  const sourceKey = `${sourceInfo.type}-${sourceInfo.name}`;
  const targetKey = `${targetInfo.type}-${targetInfo.name}`;

  // Get or initialize edge info for source resource
  if (!resourceUpdates.has(sourceKey)) {
    resourceUpdates.set(
      sourceKey,
      getExistingEdgeInfo(sourceKey, allResources)
    );
  }

  // Get or initialize edge info for target resource
  if (!resourceUpdates.has(targetKey)) {
    resourceUpdates.set(
      targetKey,
      getExistingEdgeInfo(targetKey, allResources)
    );
  }

  const sourceEdgeInfo = resourceUpdates.get(sourceKey);
  const targetEdgeInfo = resourceUpdates.get(targetKey);

  if (sourceEdgeInfo && targetEdgeInfo) {
    // Add new connection to source's "out" list (if not already present)
    const outConnection = { name: targetInfo.name, type: targetInfo.type };
    addConnectionIfNotExists(sourceEdgeInfo.out, outConnection);

    // Add new connection to target's "in" list (if not already present)
    const inConnection = { name: sourceInfo.name, type: sourceInfo.type };
    addConnectionIfNotExists(targetEdgeInfo.in, inConnection);
  }
}

// Helper function to process a pending edge deletion
function processPendingEdgeDeletion(
  pendingDeletion: PendingEdgeDeletion,
  resourceUpdates: Map<string, EdgeInfo>,
  allResources: ExistingResource[]
): void {
  const sourceKey = `${pendingDeletion.sourceResourceType}-${pendingDeletion.sourceResourceName}`;
  const targetKey = `${pendingDeletion.targetResourceType}-${pendingDeletion.targetResourceName}`;

  // Get or initialize edge info for source resource
  if (!resourceUpdates.has(sourceKey)) {
    resourceUpdates.set(
      sourceKey,
      getExistingEdgeInfo(sourceKey, allResources)
    );
  }

  // Get or initialize edge info for target resource
  if (!resourceUpdates.has(targetKey)) {
    resourceUpdates.set(
      targetKey,
      getExistingEdgeInfo(targetKey, allResources)
    );
  }

  const sourceEdgeInfo = resourceUpdates.get(sourceKey);
  const targetEdgeInfo = resourceUpdates.get(targetKey);

  if (sourceEdgeInfo && targetEdgeInfo) {
    // Remove connection from source's "out" list
    const outConnection = {
      name: pendingDeletion.targetResourceName,
      type: pendingDeletion.targetResourceType,
    };
    removeConnectionIfExists(sourceEdgeInfo.out, outConnection);

    // Remove connection from target's "in" list
    const inConnection = {
      name: pendingDeletion.sourceResourceName,
      type: pendingDeletion.sourceResourceType,
    };
    removeConnectionIfExists(targetEdgeInfo.in, inConnection);
  }
}

// Helper function to check if any edges exist for resources in a specific graph
export function hasEdgesInGraph(
  allResources: ExistingResource[],
  specificGraphName?: string
): boolean {
  if (!allResources.length) {
    return false;
  }

  for (const resource of allResources) {
    if (!isResourceInGraph(resource, specificGraphName)) {
      continue;
    }

    const edgesAnnotation = resource.annotations?.[GRAPH_EDGES_ANNOTATION_KEY];
    if (edgesAnnotation) {
      try {
        const edgeInfo: EdgeInfo = JSON.parse(edgesAnnotation);
        if (
          (Array.isArray(edgeInfo.in) && edgeInfo.in.length > 0) ||
          (Array.isArray(edgeInfo.out) && edgeInfo.out.length > 0)
        ) {
          return true;
        }
      } catch {
        // Ignore parsing errors
      }
    }
  }

  return false;
}

export function useGraphEdge(
  currentUser: User | null = null,
  specificGraphName?: string
): UseGraphEdgeReturn {
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [pendingEdges, setPendingEdges] = useState<PendingEdge[]>([]);
  const [pendingEdgeDeletions, setPendingEdgeDeletions] = useState<
    PendingEdgeDeletion[]
  >([]);

  // Mutation for adding graph edges annotation
  const addGraphEdgesMutation = useAddGraphEdgesAnnotationMutation();

  // Get resources to parse edges from
  const { allResources, isLoading: isLoadingResources } = useResources(
    currentUser as User
  );

  const queryClient = useQueryClient();

  // Parse edges from resource annotations
  const parsedEdges = useMemo(() => {
    if (isLoadingResources || !allResources.length) {
      return [];
    }

    const allEdges: ParsedEdge[] = [];

    for (const resource of allResources) {
      if (!isResourceInGraph(resource, specificGraphName)) {
        continue;
      }

      const resourceEdges = processResourceEdges(resource);
      allEdges.push(...resourceEdges);
    }

    // Deduplicate edges by ID
    const uniqueEdgeMap = new Map<string, ParsedEdge>();
    for (const edge of allEdges) {
      if (!uniqueEdgeMap.has(edge.id)) {
        uniqueEdgeMap.set(edge.id, edge);
      }
    }

    const dedupedEdges = Array.from(uniqueEdgeMap.values());

    if (editMode) {
      return dedupedEdges.map((edge) => ({
        ...edge,
        style: {
          ...edge.style,
          stroke: selectedEdges.includes(edge.id) ? "#ff6b6b" : undefined,
          strokeWidth: selectedEdges.includes(edge.id) ? 3 : undefined,
        },
        animated: selectedEdges.includes(edge.id) ? false : edge.animated,
      }));
    }

    return dedupedEdges;
  }, [
    allResources,
    isLoadingResources,
    specificGraphName,
    editMode,
    selectedEdges,
  ]);

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
              (existingEdge) =>
                (existingEdge.source === source &&
                  existingEdge.target === target) ||
                (existingEdge.source === target &&
                  existingEdge.target === source)
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

  // Handle edge clicks in edit mode
  const handleEdgeClick = useCallback(
    (event: React.MouseEvent, edge: ParsedEdge) => {
      if (!editMode) {
        return;
      }

      event.stopPropagation();
      event.preventDefault();

      setSelectedEdges((prev) => {
        if (prev.includes(edge.id)) {
          // Remove if already selected (deselect)
          return prev.filter((id) => id !== edge.id);
        }
        // Add to selection
        return [...prev, edge.id];
      });

      // When an edge is selected, add it to pending deletions
      setPendingEdgeDeletions((prev) => {
        const edgeExists = prev.some((deletion) => deletion.edgeId === edge.id);
        if (edgeExists) {
          // Remove from pending deletions if already there (user deselected)
          return prev.filter((deletion) => deletion.edgeId !== edge.id);
        }
        // Add to pending deletions
        return [
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

  // Handle applying connections with new format that supports bidirectional relationships
  const handleApplyConnections = useCallback(
    async (
      user: User,
      getResourceInfo: (
        nodeId: string
      ) => { type: ResourceType; name: string } | null
    ) => {
      if (pendingEdges.length === 0 && pendingEdgeDeletions.length === 0) {
        return;
      }

      // Group changes by resource
      const resourceUpdates = new Map<string, EdgeInfo>();

      // Process pending edge additions
      for (const pendingEdge of pendingEdges) {
        processPendingEdge(
          pendingEdge,
          getResourceInfo,
          resourceUpdates,
          allResources
        );
      }

      // Process pending edge deletions
      for (const pendingDeletion of pendingEdgeDeletions) {
        processPendingEdgeDeletion(
          pendingDeletion,
          resourceUpdates,
          allResources
        );
      }

      // Create mutations for all resources that need updates
      const mutations: Promise<unknown>[] = [];

      for (const [resourceKey, edgeInfo] of resourceUpdates.entries()) {
        const { resourceType, resourceName } = createEdgeInfoForResource(
          resourceKey,
          [], // connections not used in this context
          true // isOutgoing not used in this context
        );

        mutations.push(
          addGraphEdgesMutation.mutateAsync({
            currentUser: user,
            resourceType,
            resourceName,
            graphEdges: JSON.stringify(edgeInfo),
          })
        );
      }

      // Wait for all mutations to complete
      await Promise.all(mutations);

      // Invalidate and refetch all resource queries to update the UI
      queryClient.invalidateQueries({ queryKey: ["k8s", "direct"] });

      // Reset edit mode and clear pending state
      setEditMode(false);
      setPendingEdges([]);
      setPendingEdgeDeletions([]);
      setSelectedNodes([]);
      setSelectedEdges([]);
    },
    [
      pendingEdges,
      pendingEdgeDeletions,
      addGraphEdgesMutation,
      allResources,
      queryClient,
    ]
  );

  // Handle quitting edit mode
  const handleQuitEditMode = useCallback(() => {
    setEditMode(false);
    setPendingEdges([]);
    setPendingEdgeDeletions([]);
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, []);

  return {
    editMode,
    setEditMode,
    selectedNodes,
    selectedEdges,
    pendingEdges,
    pendingEdgeDeletions,
    parsedEdges,
    handleNodeClick,
    handleEdgeClick,
    handleApplyConnections,
    handleQuitEditMode,
    isApplyingConnections: addGraphEdgesMutation.isPending,
    isLoadingEdges: isLoadingResources,
    hasEdges: hasEdgesInGraph(allResources, specificGraphName),
  };
}
