import { useQueryClient } from "@tanstack/react-query";
import { useDeleteGraphMutation } from "@/lib/graph/graph-mutation";
import { useGraphsQuery } from "@/lib/graph/graph-query";
import type { GraphResourceGroup } from "@/lib/sealos/k8s/k8s-transform";
import type { User } from "@/payload-types";
import { useSealosStore } from "@/store/sealos-store";

interface UseGraphOverviewReturn {
  mergedGraphs: GraphResourceGroup;
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
  const { currentUser } = useSealosStore();
  const queryClient = useQueryClient();

  // Get all graphs data directly
  const { data: mergedGraphs = {}, isLoading } = useGraphsQuery(currentUser);

  // Delete graph mutation
  const deleteGraphMutation = useDeleteGraphMutation();

  const deleteGraph = async (graphName: string) => {
    const graphResources = mergedGraphs[graphName];

    if (!graphResources) {
      throw new Error(`Graph "${graphName}" not found`);
    }

    await deleteGraphMutation.mutateAsync({
      currentUser: currentUser as User,
      graphName,
      graphResources,
    });

    // Invalidate and refetch all resource queries to update the UI
    queryClient.invalidateQueries({ queryKey: ["k8s", "direct"] });
  };

  return {
    mergedGraphs,
    isLoading,
    deleteGraph,
    isDeletingGraph: deleteGraphMutation.isPending,
  };
}
