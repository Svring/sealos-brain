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

// Helper function to get kubeconfig from user
function getKubeconfig(currentUser: any): string {
  return (
    currentUser?.tokens?.find((t: any) => t.type === "kubeconfig")?.value || ""
  );
}

// Helper function to extract namespace from kubeconfig
function getNamespaceFromKubeconfig(kubeconfigYaml: string): string {
  try {
    // 1. Decode URL-encoded kubeconfig (it is usually stored encoded in DB)
    let decoded = kubeconfigYaml;
    try {
      if (kubeconfigYaml.includes("%") || kubeconfigYaml.includes("+")) {
        decoded = decodeURIComponent(kubeconfigYaml);
      }
    } catch (e) {
      console.warn("kubeconfig decode failed, fallback to raw string", e);
    }

    const lines = decoded.split("\n");

    // 2. Retrieve current-context value
    let currentContext = "";
    for (const l of lines) {
      const t = l.trim();
      if (t.startsWith("current-context:")) {
        currentContext = t.split(":")[1].trim();
        break;
      }
    }
    if (!currentContext) return "default";

    // 3. Walk through contexts list and find namespace belonging to current context
    let inContexts = false;
    let candidateName: string | null = null;
    let candidateNs: string | null = null;
    for (const l of lines) {
      const raw = l;
      const t = raw.trim();

      // detect entering contexts section
      if (!inContexts && t === "contexts:") {
        inContexts = true;
        continue;
      }
      if (!inContexts) continue;

      // contexts section ends when users: appears
      if (t === "users:") break;

      // Start of a new context block indicated by "- " at beginning (before trim)
      if (raw.startsWith("- ")) {
        // evaluate previous block
        if (candidateName === currentContext && candidateNs) return candidateNs;
        // reset for new block
        candidateName = null;
        candidateNs = null;
      }

      if (t.startsWith("name:")) {
        candidateName = t.split(":")[1].trim();
        // early return if this name matches and we already captured namespace
        if (candidateName === currentContext && candidateNs) return candidateNs;
      }

      if (t.startsWith("namespace:")) {
        candidateNs = t.split(":")[1].trim();
        // early return if we already know name matches
        if (candidateName === currentContext) return candidateNs;
      }
    }

    // Final check for last block
    if (candidateName === currentContext && candidateNs) return candidateNs;

    return "default";
  } catch (err) {
    console.warn("Failed to parse kubeconfig namespace", err);
    return "default";
  }
}

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
