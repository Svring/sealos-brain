import { useQuery } from "@tanstack/react-query";
import { useResources } from "@/hooks/use-resources";
import { groupResourcesByGraph } from "@/lib/graph/graph-utils";
import type { User } from "@/payload-types";

// Hook to get all graphs with their resources
export function useGraphsQuery(currentUser: User | null) {
  const { allResources, isLoading: isLoadingResources } = useResources(
    currentUser as User
  );

  return useQuery({
    queryKey: ["graphs", currentUser?.id],
    queryFn: () => {
      if (!allResources.length) {
        return {};
      }
      return groupResourcesByGraph(allResources);
    },
    enabled: !!currentUser && !isLoadingResources,
    staleTime: 5000, // 5 seconds for better real-time updates
  });
}

// Hook to get a specific graph's resources
export function useGraphQuery(currentUser: User | null, graphName: string) {
  const { data: allGraphs } = useGraphsQuery(currentUser);

  return useQuery({
    queryKey: ["graph", currentUser?.id, graphName],
    queryFn: () => {
      return allGraphs?.[graphName] || {};
    },
    enabled: !!currentUser && !!allGraphs,
    staleTime: 5000, // 5 seconds for better real-time updates
  });
}
