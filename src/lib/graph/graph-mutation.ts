"use client";

import { useMutation } from "@tanstack/react-query";
import {
  GRAPH_ANNOTATION_KEY,
  GRAPH_EDGES_ANNOTATION_KEY,
  type ResourceType,
} from "@/lib/sealos/k8s/k8s-constant";
import { usePatchResourceAnnotationMutation } from "@/lib/sealos/k8s/k8s-mutation";
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

// Create graph with existing resources by adding graph annotations
export function useCreateGraphWithResourcesMutation() {
  const addResourceToGraphMutation = useAddResourceToGraphMutation();

  return useMutation({
    mutationFn: async (params: {
      currentUser: User;
      graphName: string;
      resources: { [resourceType in ResourceType]?: string[] };
      namespaceOverride?: string;
    }) => {
      const { currentUser, graphName, resources, namespaceOverride } = params;

      // Collect all annotation update promises
      const annotationPromises: Promise<unknown>[] = [];

      // Iterate through each resource type and add annotations
      for (const [resourceType, resourceNames] of Object.entries(resources)) {
        if (Array.isArray(resourceNames)) {
          for (const resourceName of resourceNames) {
            annotationPromises.push(
              addResourceToGraphMutation.mutateAsync({
                currentUser,
                resourceType: resourceType as ResourceType,
                resourceName,
                graphName,
                namespaceOverride,
              })
            );
          }
        }
      }

      // Execute all annotation updates in parallel
      await Promise.all(annotationPromises);

      return {
        graphName,
        resourcesAdded: Object.entries(resources).reduce(
          (total, [_, names]) =>
            total + (Array.isArray(names) ? names.length : 0),
          0
        ),
      };
    },
  });
}

// Re-export the delete graph mutation from k8s-mutation for convenience
export { useDeleteGraphMutation } from "@/lib/sealos/k8s/k8s-mutation";
