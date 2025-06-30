import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ResourceType } from "@/lib/sealos/k8s/k8s-constant";
import { directResourceListOptions } from "@/lib/sealos/k8s/k8s-query";
import type { User } from "@/payload-types";

interface ExistingResource {
  name: string;
  type: ResourceType;
  status?: string;
  annotations?: Record<string, string>;
  labels?: Record<string, string>;
}

// Helper function to get status based on resource type
function getResourceStatus(
  item: Record<string, unknown>,
  type: ResourceType
): string {
  if (type === "cronjob") {
    return (item.status as { active?: boolean })?.active
      ? "Active"
      : "Inactive";
  }
  if (type === "deployment") {
    return (
      (item.status as { conditions?: Array<{ type?: string }> })
        ?.conditions?.[0]?.type || "Unknown"
    );
  }
  return (item.status as { phase?: string })?.phase || "Unknown";
}

interface UseResourcesReturn {
  allResources: ExistingResource[];
  isLoading: boolean;
  queries: {
    devboxQuery: unknown;
    clusterQuery: unknown;
    deploymentQuery: unknown;
    cronjobQuery: unknown;
    bucketQuery: unknown;
  };
}

export function useResources(currentUser: User): UseResourcesReturn {
  // Define resource types
  const resourceTypes: ResourceType[] = [
    "devbox",
    "cluster",
    "deployment",
    "cronjob",
    "objectstoragebucket",
  ];

  // Use useQueries to run queries in parallel
  const queries = useQueries({
    queries: resourceTypes.map((type) =>
      directResourceListOptions(currentUser, type)
    ),
  });

  // Combine all resources into a single list
  const allResources: ExistingResource[] = useMemo(() => {
    const resources: ExistingResource[] = [];

    // Process each query result
    queries.forEach((query, index) => {
      const type = resourceTypes[index];
      const items = (query.data as { items?: unknown[] })?.items || [];

      for (const item of items) {
        resources.push({
          name: (item as { metadata?: { name?: string } }).metadata?.name || "",
          type,
          status: getResourceStatus(item as Record<string, unknown>, type),
          annotations:
            (item as { metadata?: { annotations?: Record<string, string> } })
              .metadata?.annotations || {},
          labels:
            (item as { metadata?: { labels?: Record<string, string> } })
              .metadata?.labels || {},
        });
      }
    });

    return resources;
  }, [queries]);

  // Determine loading state
  const isLoading = queries.some((query) => query.isLoading);

  // Map queries to their respective types for return value
  const queryMap = {
    devboxQuery: queries[0],
    clusterQuery: queries[1],
    deploymentQuery: queries[2],
    cronjobQuery: queries[3],
    bucketQuery: queries[4],
  };

  return {
    allResources,
    isLoading,
    queries: queryMap,
  };
}

export type { ExistingResource };
