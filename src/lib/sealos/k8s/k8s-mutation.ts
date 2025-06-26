"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/payload-types";
import {
  deleteGraphByRemovingAnnotations,
  patchResourceAnnotation,
  removeResourceAnnotation,
} from "./k8s-actions";
import type { ResourceType } from "./k8s-constant";
import { getKubeconfig, getNamespaceFromKubeconfig } from "./k8s-utils";

// Generic patch resource annotation mutation
export function usePatchResourceAnnotationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      currentUser: User;
      resourceType: ResourceType;
      resourceName: string;
      annotationKey: string;
      annotationValue: string;
      namespaceOverride?: string;
    }) => {
      const kubeconfig = getKubeconfig(params.currentUser);

      const namespace =
        params.namespaceOverride ||
        (await getNamespaceFromKubeconfig(kubeconfig));

      return await patchResourceAnnotation(
        kubeconfig,
        params.resourceType,
        params.resourceName,
        params.annotationKey,
        params.annotationValue,
        namespace
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["graphs"] });
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
    },
  });
}

// Generic remove resource annotation mutation
export function useRemoveResourceAnnotationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      currentUser: User;
      resourceType: ResourceType;
      resourceName: string;
      annotationKey: string;
      namespaceOverride?: string;
    }) => {
      const kubeconfig = getKubeconfig(params.currentUser);

      const namespace =
        params.namespaceOverride ||
        (await getNamespaceFromKubeconfig(kubeconfig));

      return await removeResourceAnnotation(
        kubeconfig,
        params.resourceType,
        params.resourceName,
        params.annotationKey,
        namespace
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["graphs"] });
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
    },
  });
}

// Delete graph mutation (moved from k8s-transform)
export function useDeleteGraphMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      currentUser: User;
      graphName: string;
      graphResources: { [resourceKind: string]: string[] };
      namespaceOverride?: string;
    }) => {
      const kubeconfig = getKubeconfig(params.currentUser);

      const namespace =
        params.namespaceOverride ||
        (await getNamespaceFromKubeconfig(kubeconfig));

      return await deleteGraphByRemovingAnnotations(
        kubeconfig,
        params.graphName,
        params.graphResources,
        namespace
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["graphs"] });
    },
  });
}
