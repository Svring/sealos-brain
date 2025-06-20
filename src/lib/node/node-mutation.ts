import { Node, Edge, Position, MarkerType } from "@xyflow/react";

/**
 * Add an edge between two nodes. This is a **pure** helper: it returns new
 * arrays and does **not** mutate the originals. You can use it alongside the
 * React-Flow hooks (`useNodesState`, `useEdgesState`) like so:
 *
 * ```ts
 * const [nodes, setNodes] = useNodesState(initialNodes);
 * const [edges, setEdges] = useEdgesState(initialEdges);
 *
 * const result = addEdgeBetweenNodes(nodes, edges, "sourceId", "targetId");
 * setNodes(result.nodes);
 * setEdges(result.edges);
 * ```
 *
 * The function will also ensure the involved nodes expose suitable handles by
 * setting `sourcePosition` on the **from** node and `targetPosition` on the
 * **to** node when they are missing. That way the new connection renders
 * cleanly without modifying the custom node components themselves.
 */
export function addEdgeBetweenNodes(
  nodes: Node[],
  edges: Edge[],
  fromId: string,
  toId: string,
  /**
   * Optional explicit edge id. If omitted a deterministic `${fromId}-to-${toId}`
   * id is used.
   */
  edgeId?: string
): { nodes: Node[]; edges: Edge[] } {
  // Early exit if ids are identical
  if (fromId === toId) {
    console.warn(
      "addEdgeBetweenNodes: source and target are identical",
      fromId
    );
    return { nodes, edges };
  }

  // Confirm the nodes exist
  const fromNode = nodes.find((n) => n.id === fromId);
  const toNode = nodes.find((n) => n.id === toId);

  if (!fromNode || !toNode) {
    console.error("addEdgeBetweenNodes: One or both node ids not found", {
      fromId,
      toId,
    });
    return { nodes, edges };
  }

  // Create edge (avoid duplicates)
  const newEdgeId = edgeId ?? `${fromId}-to-${toId}`;
  const edgeAlreadyExists = edges.some((e) => e.id === newEdgeId);
  const nextEdges: Edge[] = edgeAlreadyExists
    ? edges
    : [
        ...edges,
        {
          id: newEdgeId,
          source: fromId,
          target: toId,
          type: "step-edge",
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        } as Edge,
      ];

  // Ensure handles (sourcePosition / targetPosition) are present for visual clarity
  const nextNodes: Node[] = nodes.map((node) => {
    if (node.id === fromId && node.sourcePosition == null) {
      return { ...node, sourcePosition: Position.Bottom };
    }
    if (node.id === toId && node.targetPosition == null) {
      return { ...node, targetPosition: Position.Top };
    }
    return node;
  });

  return { nodes: nextNodes, edges: nextEdges };
}
