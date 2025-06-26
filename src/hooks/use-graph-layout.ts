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
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction, ranksep: 150, nodesep: 150 });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      width: node.measured?.width ?? 200, // Default width if not measured
      height: node.measured?.height ?? 100, // Default height if not measured
    })
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 200) / 2;
      const y = position.y - (node.measured?.height ?? 100) / 2;

      return { ...node, position: { x, y } };
    }),
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
      direction: "TB" | "LR" | "BT" | "RL" = "TB"
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
