"use client";

import { useMutation } from "@tanstack/react-query";
import {
  GRAPH_ANNOTATION_KEY,
  GRAPH_EDGES_ANNOTATION_KEY,
  type ResourceType,
} from "@/lib/sealos/k8s/k8s-constant";
import {
  useDeleteGraphMutation as useDeleteGraphMutationBase,
  usePatchResourceAnnotationMutation,
} from "@/lib/sealos/k8s/k8s-mutation";
import type { User } from "@/payload-types";

// Add resource to graph by adding graphName annotation
export function useAddResourceToGraphMutation() {
  const patchAnnotationMutation = usePatchResourceAnnotationMutation();

  return useMutation({
    mutationFn: async (params: {
      currentUser: User;
      resourceType: ResourceType;
      resourceName: string;
      graphName: string;
      namespaceOverride?: string;
    }) => {
      return await patchAnnotationMutation.mutateAsync({
        currentUser: params.currentUser,
        resourceType: params.resourceType,
        resourceName: params.resourceName,
        annotationKey: GRAPH_ANNOTATION_KEY,
        annotationValue: params.graphName,
        namespaceOverride: params.namespaceOverride,
      });
    },
  });
}

// Add graph edges annotation to a resource
export function useAddGraphEdgesAnnotationMutation() {
  const patchAnnotationMutation = usePatchResourceAnnotationMutation();

  return useMutation({
    mutationFn: async (params: {
      currentUser: User;
      resourceType: ResourceType;
      resourceName: string;
      graphEdges: string;
      namespaceOverride?: string;
    }) => {
      return await patchAnnotationMutation.mutateAsync({
        currentUser: params.currentUser,
        resourceType: params.resourceType,
        resourceName: params.resourceName,
        annotationKey: GRAPH_EDGES_ANNOTATION_KEY,
        annotationValue: params.graphEdges,
        namespaceOverride: params.namespaceOverride,
      });
    },
  });
}

// Delete graph by removing graphName annotations from all resources
export function useDeleteGraphMutation() {
  const deleteGraphMutation = useDeleteGraphMutationBase();

  return useMutation({
    mutationFn: async (params: {
      currentUser: User;
      graphName: string;
      graphResources: { [resourceKind: string]: string[] };
      namespaceOverride?: string;
    }) => {
      return await deleteGraphMutation.mutateAsync({
        currentUser: params.currentUser,
        graphName: params.graphName,
        graphResources: params.graphResources,
        namespaceOverride: params.namespaceOverride,
      });
    },
  });
}
