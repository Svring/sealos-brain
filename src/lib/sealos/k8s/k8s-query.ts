"use client";

import { queryOptions } from "@tanstack/react-query";
import { queryDebugLog } from "@/lib/query-debug-log";
import { listResourcesByType, readDevboxSecret } from "./k8s-actions";
import {
  getKubeconfig,
  getNamespaceFromKubeconfig,
  type ResourceType,
} from "./k8s-utils";

// Generic resource list query options
export function directResourceListOptions(
  currentUser: any,
  resourceType: ResourceType,
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

// Direct Devbox secret query options
export function directDevboxSecretOptions(
  currentUser: any,
  devboxName: string,
  namespaceOverride?: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "k8s",
      "direct",
      "devbox",
      "secret",
      devboxName,
      namespaceOverride,
      currentUser?.id,
    ],
    enabled: !!currentUser && !!devboxName,
    queryFn: async () => {
      const kubeconfig = getKubeconfig(currentUser);
      if (!kubeconfig) {
        throw new Error("No kubeconfig found");
      }

      const namespace =
        namespaceOverride || getNamespaceFromKubeconfig(kubeconfig);

      queryDebugLog("directDevboxSecretOptions", {
        devboxName,
        namespace,
        userId: currentUser?.id,
      });

      return await readDevboxSecret(kubeconfig, devboxName, namespace);
    },
    select: postprocess,
  });
}
