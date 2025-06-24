import { Edge, MarkerType } from "@xyflow/react";

/**
 * Connect one or multiple source node IDs to a target node ID.
 * Returns a list of edges (does not mutate any existing edge array).
 *
 * @param sourceIds - A single node ID or an array of node IDs to connect from
 * @param targetId - The node ID to connect to
 * @param edgeType - (optional) The edge type, defaults to 'step-edge'
 */
export function connectNodesToTarget(
  sourceIds: string | string[],
  targetId: string,
  edgeType: string = "step-edge"
): Edge[] {
  const sources = Array.isArray(sourceIds) ? sourceIds : [sourceIds];
  return sources.map((fromId) => ({
    id: `${fromId}-to-${targetId}`,
    source: fromId,
    target: targetId,
    type: edgeType,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  }));
}
