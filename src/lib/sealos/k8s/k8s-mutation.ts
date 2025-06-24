"use client";

import {
  getNamespaceFromKubeconfig,
  getKubeconfig,
  type ResourceType,
} from "./k8s-utils";
import {
  patchResourceAnnotation,
  removeResourceAnnotation,
  deleteGraphByRemovingAnnotations,
} from "./k8s-actions";
import { useMutation } from "@tanstack/react-query";

// Generic patch resource annotation mutation
export function usePatchResourceAnnotationMutation() {
  return useMutation({
    mutationFn: async (params: {
      currentUser: any;
      resourceType: ResourceType;
      resourceName: string;
      annotationKey: string;
      annotationValue: string;
      namespaceOverride?: string;
    }) => {
      const kubeconfig = getKubeconfig(params.currentUser);
      if (!kubeconfig) {
        throw new Error("No kubeconfig found");
      }

      const namespace =
        params.namespaceOverride || getNamespaceFromKubeconfig(kubeconfig);

      return patchResourceAnnotation(
        kubeconfig,
        params.resourceType,
        params.resourceName,
        params.annotationKey,
        params.annotationValue,
        namespace
      );
    },
  });
}

// Generic remove resource annotation mutation
export function useRemoveResourceAnnotationMutation() {
  return useMutation({
    mutationFn: async (params: {
      currentUser: any;
      resourceType: ResourceType;
      resourceName: string;
      annotationKey: string;
      namespaceOverride?: string;
    }) => {
      const kubeconfig = getKubeconfig(params.currentUser);
      if (!kubeconfig) {
        throw new Error("No kubeconfig found");
      }

      const namespace =
        params.namespaceOverride || getNamespaceFromKubeconfig(kubeconfig);

      return removeResourceAnnotation(
        kubeconfig,
        params.resourceType,
        params.resourceName,
        params.annotationKey,
        namespace
      );
    },
  });
}

// Delete graph mutation (moved from k8s-transform)
export function useDeleteGraphMutation() {
  return useMutation({
    mutationFn: async (params: {
      currentUser: any;
      graphName: string;
      graphResources: { [resourceKind: string]: string[] };
      namespaceOverride?: string;
    }) => {
      const kubeconfig = getKubeconfig(params.currentUser);
      if (!kubeconfig) {
        throw new Error("No kubeconfig found");
      }

      const namespace =
        params.namespaceOverride || getNamespaceFromKubeconfig(kubeconfig);

      return deleteGraphByRemovingAnnotations(
        kubeconfig,
        params.graphName,
        params.graphResources,
        namespace
      );
    },
  });
}
