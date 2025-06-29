import { useQuery } from "@tanstack/react-query";
import { type ExistingResource, useResources } from "@/hooks/use-resources";
import { GRAPH_ANNOTATION_KEY } from "@/lib/sealos/k8s/k8s-constant";
import type { GraphResourceGroup } from "@/lib/sealos/k8s/k8s-transform";
import type { User } from "@/payload-types";

// Helper function to group resources by graph
function groupResourcesByGraph(
  allResources: ExistingResource[]
): GraphResourceGroup {
  return allResources.reduce((graphGroups, resource) => {
    const graphName = resource.annotations?.[GRAPH_ANNOTATION_KEY];
    if (graphName) {
      graphGroups[graphName] ??= {};
      graphGroups[graphName][resource.type] ??= [];
      graphGroups[graphName][resource.type].push(resource.name);
    }
    return graphGroups;
  }, {} as GraphResourceGroup);
}

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
    staleTime: 30_000,
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
    staleTime: 30_000, // 30 seconds
  });
}
