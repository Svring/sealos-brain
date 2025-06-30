"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/payload-types";
import {
  deleteGraphByRemovingLabels,
  patchResourceAnnotation,
  patchResourceLabel,
  removeResourceAnnotation,
  removeResourceLabel,
} from "./k8s-actions";
import type { ResourceType } from "./k8s-constant";
import { getKubeconfig, getNamespaceFromKubeconfig } from "./k8s-utils";

// Generic patch resource annotation mutation (keep for edges)
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
      queryClient.invalidateQueries({ queryKey: ["k8s", "direct"] });
      queryClient.invalidateQueries({ queryKey: ["graphs"] });
      queryClient.invalidateQueries({ queryKey: ["graph"] });
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
    },
  });
}

// Generic patch resource label mutation (new for graphName)
export function usePatchResourceLabelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      currentUser: User;
      resourceType: ResourceType;
      resourceName: string;
      labelKey: string;
      labelValue: string;
      namespaceOverride?: string;
    }) => {
      const kubeconfig = getKubeconfig(params.currentUser);

      const namespace =
        params.namespaceOverride ||
        (await getNamespaceFromKubeconfig(kubeconfig));

      return await patchResourceLabel(
        kubeconfig,
        params.resourceType,
        params.resourceName,
        params.labelKey,
        params.labelValue,
        namespace
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["k8s", "direct"] });
      queryClient.invalidateQueries({ queryKey: ["graphs"] });
      queryClient.invalidateQueries({ queryKey: ["graph"] });
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
    },
  });
}

// Generic remove resource annotation mutation (keep for edges)
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
      queryClient.invalidateQueries({ queryKey: ["k8s", "direct"] });
      queryClient.invalidateQueries({ queryKey: ["graphs"] });
      queryClient.invalidateQueries({ queryKey: ["graph"] });
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
    },
  });
}

// Generic remove resource label mutation (new for graphName)
export function useRemoveResourceLabelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      currentUser: User;
      resourceType: ResourceType;
      resourceName: string;
      labelKey: string;
      namespaceOverride?: string;
    }) => {
      const kubeconfig = getKubeconfig(params.currentUser);

      const namespace =
        params.namespaceOverride ||
        (await getNamespaceFromKubeconfig(kubeconfig));

      return await removeResourceLabel(
        kubeconfig,
        params.resourceType,
        params.resourceName,
        params.labelKey,
        namespace
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["k8s", "direct"] });
      queryClient.invalidateQueries({ queryKey: ["graphs"] });
      queryClient.invalidateQueries({ queryKey: ["graph"] });
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
    },
  });
}

// Delete graph mutation (updated to use labels)
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

      return await deleteGraphByRemovingLabels(
        kubeconfig,
        params.graphName,
        params.graphResources,
        namespace
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["k8s", "direct"] });
      queryClient.invalidateQueries({ queryKey: ["graphs"] });
      queryClient.invalidateQueries({ queryKey: ["graph"] });
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
    },
  });
}
