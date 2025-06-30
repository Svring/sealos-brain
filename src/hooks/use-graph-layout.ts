import Dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";
import { useCallback } from "react";

interface LayoutOptions {
  direction: "TB" | "LR" | "BT" | "RL";
}

interface LayoutedElements {
  nodes: Node[];
  edges: Edge[];
}

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions
): LayoutedElements => {
  if (nodes.length === 0) {
    return { nodes, edges };
  }

  // Separate connected and unconnected nodes
  const connectedNodeIds = new Set<string>();

  // Identify all nodes that are part of the graph (have edges)
  for (const edge of edges) {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  }

  const connectedNodes = nodes.filter((node) => connectedNodeIds.has(node.id));
  const unconnectedNodes = nodes.filter(
    (node) => !connectedNodeIds.has(node.id)
  );

  let layoutedConnectedNodes: Node[] = [];

  // Layout connected nodes using Dagre if there are any
  if (connectedNodes.length > 0 && edges.length > 0) {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({
      rankdir: options.direction,
      ranksep: 200, // Increased vertical spacing between ranks
      nodesep: 200, // Increased horizontal spacing between nodes
      edgesep: 50, // Add edge separation to prevent edge overlaps
      align: "UL", // Align nodes to upper-left for consistent spacing
    });

    // Add edges to the graph
    for (const edge of edges) {
      g.setEdge(edge.source, edge.target);
    }

    // Add nodes to the graph
    for (const node of connectedNodes) {
      g.setNode(node.id, {
        width: node.measured?.width ?? 200, // Default width if not measured
        height: node.measured?.height ?? 100, // Default height if not measured
      });
    }

    Dagre.layout(g);

    layoutedConnectedNodes = connectedNodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 200) / 2;
      const y = position.y - (node.measured?.height ?? 100) / 2;

      return { ...node, position: { x, y } };
    });
  } else {
    layoutedConnectedNodes = connectedNodes;
  }

  // Calculate the bounds of connected nodes to position unconnected nodes below
  let maxY = 0;
  if (layoutedConnectedNodes.length > 0) {
    maxY = Math.max(
      ...layoutedConnectedNodes.map(
        (node) => node.position.y + (node.measured?.height ?? 100)
      )
    );
  }

  // Layout unconnected nodes in a grid below connected nodes
  const gridStartY = maxY + 150; // Increased gap between connected and unconnected nodes
  const gridCols = 4;
  const gridSpacingX = 300; // Increased horizontal spacing
  const gridSpacingY = 220; // Increased vertical spacing

  const layoutedUnconnectedNodes = unconnectedNodes.map((node, index) => {
    const col = index % gridCols;
    const row = Math.floor(index / gridCols);
    const x = col * gridSpacingX;
    const y = gridStartY + row * gridSpacingY;

    return {
      ...node,
      position: { x, y },
    };
  });

  // Combine all nodes
  const allLayoutedNodes = [
    ...layoutedConnectedNodes,
    ...layoutedUnconnectedNodes,
  ];

  return {
    nodes: allLayoutedNodes,
    edges,
  };
};

export interface UseGraphLayoutReturn {
  applyLayout: (
    nodes: Node[],
    edges: Edge[],
    direction?: "TB" | "LR" | "BT" | "RL"
  ) => LayoutedElements;
}

export function useGraphLayout(): UseGraphLayoutReturn {
  const applyLayout = useCallback(
    (
      nodes: Node[],
      edges: Edge[],
      direction: "TB" | "LR" | "BT" | "RL" = "BT" // Default to bottom-to-top
    ): LayoutedElements => {
      if (nodes.length === 0) {
        return { nodes, edges };
      }

      return getLayoutedElements(nodes, edges, { direction });
    },
    []
  );

  return {
    applyLayout,
  };
}
