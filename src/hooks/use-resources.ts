import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ResourceType } from "@/lib/sealos/k8s/k8s-constant";
import { directResourceListOptions } from "@/lib/sealos/k8s/k8s-query";
import type { User } from "@/payload-types";

interface ExistingResource {
  name: string;
  type: ResourceType;
  status?: string;
  annotations?: Record<string, string>;
}

interface UseResourcesReturn {
  allResources: ExistingResource[];
  isLoading: boolean;
  queries: {
    devboxQuery: any;
    clusterQuery: any;
    deploymentQuery: any;
    cronjobQuery: any;
    bucketQuery: any;
  };
}

export function useResources(currentUser: User): UseResourcesReturn {
  // Fetch all resource types
  const devboxQuery = useQuery(
    directResourceListOptions(currentUser, "devbox")
  );
  const clusterQuery = useQuery(
    directResourceListOptions(currentUser, "cluster")
  );
  const deploymentQuery = useQuery(
    directResourceListOptions(currentUser, "deployment")
  );
  const cronjobQuery = useQuery(
    directResourceListOptions(currentUser, "cronjob")
  );
  const bucketQuery = useQuery(
    directResourceListOptions(currentUser, "objectstoragebucket")
  );

  // Combine all resources into a single list
  const allResources: ExistingResource[] = useMemo(() => {
    const resources: ExistingResource[] = [];

    // Add devboxes
    const devboxItems = devboxQuery.data?.items || [];
    for (const item of devboxItems) {
      resources.push({
        name: item.metadata?.name || "",
        type: "devbox",
        status: item.status?.phase || "Unknown",
        annotations: item.metadata?.annotations || {},
      });
    }

    // Add clusters
    const clusterItems = clusterQuery.data?.items || [];
    for (const item of clusterItems) {
      resources.push({
        name: item.metadata?.name || "",
        type: "cluster",
        status: item.status?.phase || "Unknown",
        annotations: item.metadata?.annotations || {},
      });
    }

    // Add deployments
    const deploymentItems = deploymentQuery.data?.items || [];
    for (const item of deploymentItems) {
      resources.push({
        name: item.metadata?.name || "",
        type: "deployment",
        status: item.status?.conditions?.[0]?.type || "Unknown",
        annotations: item.metadata?.annotations || {},
      });
    }

    // Add cronjobs
    const cronjobItems = cronjobQuery.data?.items || [];
    for (const item of cronjobItems) {
      resources.push({
        name: item.metadata?.name || "",
        type: "cronjob",
        status: item.status?.active ? "Active" : "Inactive",
        annotations: item.metadata?.annotations || {},
      });
    }

    // Add object storage buckets
    const bucketItems = bucketQuery.data?.items || [];
    for (const item of bucketItems) {
      resources.push({
        name: item.metadata?.name || "",
        type: "objectstoragebucket",
        status: item.status?.phase || "Unknown",
        annotations: item.metadata?.annotations || {},
      });
    }

    return resources;
  }, [
    devboxQuery.data,
    clusterQuery.data,
    deploymentQuery.data,
    cronjobQuery.data,
    bucketQuery.data,
  ]);

  const isLoading =
    devboxQuery.isLoading ||
    clusterQuery.isLoading ||
    deploymentQuery.isLoading ||
    cronjobQuery.isLoading ||
    bucketQuery.isLoading;

  return {
    allResources,
    isLoading,
    queries: {
      devboxQuery,
      clusterQuery,
      deploymentQuery,
      cronjobQuery,
      bucketQuery,
    },
  };
}

export type { ExistingResource };
