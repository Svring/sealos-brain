import { useQueryClient } from "@tanstack/react-query";
import {
  useDeleteAllGraphResourcesMutation,
  useDeleteGraphMutation,
} from "@/lib/graph/graph-mutation";
import { useGraphsQuery } from "@/lib/graph/graph-query";
import type { GraphResourceGroup } from "@/lib/sealos/k8s/k8s-transform";
import type { User } from "@/payload-types";
import { useSealosStore } from "@/store/sealos-store";

interface UseGraphOverviewReturn {
  mergedGraphs: GraphResourceGroup;
  isLoading: boolean;
  deleteGraph: (graphName: string) => Promise<void>;
  deleteAllGraphResources: (graphName: string) => Promise<void>;
  isDeletingGraph: boolean;
  isDeletingAllResources: boolean;
}

/**
 * Hook for graph overview functionality
 * Used in /graph page to display all graphs as cards
 * Optimized for performance - doesn't include ReactFlow nodes/edges
 */
export function useGraphOverview(): UseGraphOverviewReturn {
  const { currentUser, regionUrl } = useSealosStore();
  const queryClient = useQueryClient();

  // Get all graphs data directly
  const { data: mergedGraphs = {}, isLoading } = useGraphsQuery(currentUser);

  // Delete graph mutation (only removes graph annotations)
  const deleteGraphMutation = useDeleteGraphMutation();

  // Delete all resources mutation (deletes actual resources)
  const deleteAllResourcesMutation = useDeleteAllGraphResourcesMutation();

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

  const deleteAllGraphResources = async (graphName: string) => {
    const graphResources = mergedGraphs[graphName];

    if (!graphResources) {
      throw new Error(`Graph "${graphName}" not found`);
    }

    if (!regionUrl) {
      throw new Error("Region URL is required");
    }

    await deleteAllResourcesMutation.mutateAsync({
      currentUser: currentUser as User,
      graphName,
      graphResources,
      regionUrl,
    });

    // Invalidate and refetch all resource queries to update the UI
    queryClient.invalidateQueries({ queryKey: ["k8s", "direct"] });
    queryClient.invalidateQueries({ queryKey: ["graphs"] });
    queryClient.invalidateQueries({ queryKey: ["graph"] });
    queryClient.invalidateQueries({ queryKey: ["nodes"] });
  };

  return {
    mergedGraphs,
    isLoading,
    deleteGraph,
    deleteAllGraphResources,
    isDeletingGraph: deleteGraphMutation.isPending,
    isDeletingAllResources: deleteAllResourcesMutation.isPending,
  };
}
