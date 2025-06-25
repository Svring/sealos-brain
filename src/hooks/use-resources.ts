import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ResourceType } from "@/lib/sealos/k8s/k8s-constant";
import { directResourceListOptions } from "@/lib/sealos/k8s/k8s-query";

interface ExistingResource {
  name: string;
  type: ResourceType;
  status?: string;
  annotations?: Record<string, string>;
}

interface UseResourcesReturn {
  allResources: ExistingResource[];
  isLoading: boolean;
  refetchAll: () => void;
  queries: {
    devboxQuery: any;
    clusterQuery: any;
    deploymentQuery: any;
    cronjobQuery: any;
    bucketQuery: any;
  };
}

export function useResources(currentUser: any): UseResourcesReturn {
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
    const devboxItems =
      devboxQuery.data?.body?.items || devboxQuery.data?.items || [];
    devboxItems.forEach((item: any) => {
      resources.push({
        name: item.metadata?.name || "",
        type: "devbox",
        status: item.status?.phase || "Unknown",
        annotations: item.metadata?.annotations || {},
      });
    });

    // Add clusters
    const clusterItems =
      clusterQuery.data?.body?.items || clusterQuery.data?.items || [];
    clusterItems.forEach((item: any) => {
      resources.push({
        name: item.metadata?.name || "",
        type: "cluster",
        status: item.status?.phase || "Unknown",
        annotations: item.metadata?.annotations || {},
      });
    });

    // Add deployments
    const deploymentItems =
      deploymentQuery.data?.body?.items || deploymentQuery.data?.items || [];
    deploymentItems.forEach((item: any) => {
      resources.push({
        name: item.metadata?.name || "",
        type: "deployment",
        status: item.status?.conditions?.[0]?.type || "Unknown",
        annotations: item.metadata?.annotations || {},
      });
    });

    // Add cronjobs
    const cronjobItems =
      cronjobQuery.data?.body?.items || cronjobQuery.data?.items || [];
    cronjobItems.forEach((item: any) => {
      resources.push({
        name: item.metadata?.name || "",
        type: "cronjob",
        status: item.status?.active ? "Active" : "Inactive",
        annotations: item.metadata?.annotations || {},
      });
    });

    // Add object storage buckets
    const bucketItems =
      bucketQuery.data?.body?.items || bucketQuery.data?.items || [];
    bucketItems.forEach((item: any) => {
      resources.push({
        name: item.metadata?.name || "",
        type: "objectstoragebucket",
        status: item.status?.phase || "Unknown",
        annotations: item.metadata?.annotations || {},
      });
    });

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

  const refetchAll = () => {
    devboxQuery.refetch();
    clusterQuery.refetch();
    deploymentQuery.refetch();
    cronjobQuery.refetch();
    bucketQuery.refetch();
  };

  return {
    allResources,
    isLoading,
    refetchAll,
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
