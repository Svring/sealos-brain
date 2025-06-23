"use client";

import { queryOptions } from "@tanstack/react-query";
import { queryDebugLog } from "@/lib/query-debug-log";
import {
  listDevboxes,
  listClusters,
  listDeployments,
  listCronJobs,
  listObjectStorageBuckets,
  listResourcesByType,
} from "./k8s-actions";
import { getKubeconfig, getNamespaceFromKubeconfig } from "./k8s-utils";

// Direct Devbox query options
export function directDevboxListOptions(
  currentUser: any,
  namespaceOverride?: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "k8s",
      "direct",
      "devbox",
      "list",
      namespaceOverride,
      currentUser?.id,
    ],
    enabled: !!currentUser,
    queryFn: async () => {
      const kubeconfig = getKubeconfig(currentUser);
      if (!kubeconfig) {
        throw new Error("No kubeconfig found");
      }

      const namespace =
        namespaceOverride || getNamespaceFromKubeconfig(kubeconfig);

      console.log("directDevboxListOptions: Using namespace:", namespace);
      console.log(
        "directDevboxListOptions: namespaceOverride:",
        namespaceOverride
      );

      queryDebugLog("directDevboxListOptions", {
        namespace,
        userId: currentUser?.id,
      });

      return await listDevboxes(kubeconfig, namespace);
    },
    select: postprocess,
  });
}

// Direct Cluster query options
export function directClusterListOptions(
  currentUser: any,
  namespaceOverride?: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "k8s",
      "direct",
      "cluster",
      "list",
      namespaceOverride,
      currentUser?.id,
    ],
    enabled: !!currentUser,
    queryFn: async () => {
      const kubeconfig = getKubeconfig(currentUser);
      if (!kubeconfig) {
        throw new Error("No kubeconfig found");
      }

      const namespace =
        namespaceOverride || getNamespaceFromKubeconfig(kubeconfig);

      queryDebugLog("directClusterListOptions", {
        namespace,
        userId: currentUser?.id,
      });

      return await listClusters(kubeconfig, namespace);
    },
    select: postprocess,
  });
}

// Direct Deployment query options
export function directDeploymentListOptions(
  currentUser: any,
  namespaceOverride?: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "k8s",
      "direct",
      "deployment",
      "list",
      namespaceOverride,
      currentUser?.id,
    ],
    enabled: !!currentUser,
    queryFn: async () => {
      const kubeconfig = getKubeconfig(currentUser);
      if (!kubeconfig) {
        throw new Error("No kubeconfig found");
      }

      const namespace =
        namespaceOverride || getNamespaceFromKubeconfig(kubeconfig);

      queryDebugLog("directDeploymentListOptions", {
        namespace,
        userId: currentUser?.id,
      });

      return await listDeployments(kubeconfig, namespace);
    },
    select: postprocess,
  });
}

// Direct CronJob query options
export function directCronJobListOptions(
  currentUser: any,
  namespaceOverride?: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "k8s",
      "direct",
      "cronjob",
      "list",
      namespaceOverride,
      currentUser?.id,
    ],
    enabled: !!currentUser,
    queryFn: async () => {
      const kubeconfig = getKubeconfig(currentUser);
      if (!kubeconfig) {
        throw new Error("No kubeconfig found");
      }

      const namespace =
        namespaceOverride || getNamespaceFromKubeconfig(kubeconfig);

      queryDebugLog("directCronJobListOptions", {
        namespace,
        userId: currentUser?.id,
      });

      return await listCronJobs(kubeconfig, namespace);
    },
    select: postprocess,
  });
}

// Direct ObjectStorageBucket query options
export function directObjectStorageBucketListOptions(
  currentUser: any,
  namespaceOverride?: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "k8s",
      "direct",
      "objectstoragebucket",
      "list",
      namespaceOverride,
      currentUser?.id,
    ],
    enabled: !!currentUser,
    queryFn: async () => {
      const kubeconfig = getKubeconfig(currentUser);
      if (!kubeconfig) {
        throw new Error("No kubeconfig found");
      }

      const namespace =
        namespaceOverride || getNamespaceFromKubeconfig(kubeconfig);

      queryDebugLog("directObjectStorageBucketListOptions", {
        namespace,
        userId: currentUser?.id,
      });

      return await listObjectStorageBuckets(kubeconfig, namespace);
    },
    select: postprocess,
  });
}

// Direct generic resource query options
export function directResourceListOptions(
  currentUser: any,
  resourceType:
    | "devbox"
    | "cluster"
    | "deployment"
    | "cronjob"
    | "objectstoragebucket",
  namespaceOverride?: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "k8s",
      "direct",
      resourceType,
      "list",
      namespaceOverride,
      currentUser?.id,
    ],
    enabled: !!currentUser,
    queryFn: async () => {
      const kubeconfig = getKubeconfig(currentUser);
      if (!kubeconfig) {
        throw new Error("No kubeconfig found");
      }

      const namespace =
        namespaceOverride || getNamespaceFromKubeconfig(kubeconfig);

      queryDebugLog("directResourceListOptions", {
        resourceType,
        namespace,
        userId: currentUser?.id,
      });

      return await listResourcesByType(kubeconfig, resourceType, namespace);
    },
    select: postprocess,
  });
}

// Usage examples:
// const { currentUser } = useSealosStore();
//
// // Auto-detects namespace from kubeconfig (ns-gapyo0ig in your example)
// const devboxQuery = useQuery(directDevboxListOptions(currentUser));
// const clusterQuery = useQuery(directClusterListOptions(currentUser));
// const deploymentQuery = useQuery(directDeploymentListOptions(currentUser));
// const cronJobQuery = useQuery(directCronJobListOptions(currentUser));
// const bucketQuery = useQuery(directObjectStorageBucketListOptions(currentUser));
//
// // Override namespace if needed
// const devboxQueryCustomNs = useQuery(directDevboxListOptions(currentUser, "custom-namespace"));
//
// // Generic resource query
// const genericQuery = useQuery(directResourceListOptions(currentUser, "devbox"));
