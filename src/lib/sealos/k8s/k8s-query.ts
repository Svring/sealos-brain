"use client";

import { queryOptions } from "@tanstack/react-query";
import { queryDebugLog } from "@/lib/query-debug-log";
import type { User } from "@/payload-types";
import { listResourcesByType, readDevboxSecret } from "./k8s-actions";
import type { ResourceType } from "./k8s-constant";
import { getKubeconfig, getNamespaceFromKubeconfig } from "./k8s-utils";

// Generic resource list query options
export function directResourceListOptions(
  currentUser: User | null,
  resourceType: ResourceType,
  namespaceOverride?: string,
  postprocess: (data: unknown) => unknown = (d) => d
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
      const kubeconfig = getKubeconfig(currentUser as User);
      if (!kubeconfig) {
        throw new Error("No kubeconfig found");
      }

      const namespace =
        namespaceOverride || (await getNamespaceFromKubeconfig(kubeconfig));

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
  currentUser: User | null,
  devboxName: string,
  namespaceOverride?: string,
  postprocess: (data: unknown) => unknown = (d) => d
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
      const kubeconfig = getKubeconfig(currentUser as User);
      if (!kubeconfig) {
        throw new Error("No kubeconfig found");
      }

      const namespace =
        namespaceOverride || (await getNamespaceFromKubeconfig(kubeconfig));

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
