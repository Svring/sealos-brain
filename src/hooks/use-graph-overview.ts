import { useGraphNode } from "@/hooks/use-graph-node";

interface UseGraphOverviewReturn {
  mergedGraphs: Record<string, Record<string, string[]>>;
  isLoading: boolean;
  deleteGraph: (graphName: string) => Promise<void>;
  isDeletingGraph: boolean;
}

/**
 * Hook for graph overview functionality
 * Used in /graph page to display all graphs as cards
 * Optimized for performance - doesn't include ReactFlow nodes/edges
 */
export function useGraphOverview(): UseGraphOverviewReturn {
  // Get all graphs data without specific graph name
  const { mergedGraphs, isLoading, deleteGraph, isDeletingGraph } =
    useGraphNode();

  return {
    mergedGraphs,
    isLoading,
    deleteGraph,
    isDeletingGraph,
  };
}
