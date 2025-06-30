"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGraphByRemovingLabels as k8sDeleteGraphByRemovingLabels } from "@/lib/sealos/k8s/k8s-actions";
import {
  GRAPH_EDGES_ANNOTATION_KEY,
  GRAPH_NAME_LABEL_KEY,
  type ResourceType,
} from "@/lib/sealos/k8s/k8s-constant";
import {
  usePatchResourceAnnotationMutation,
  usePatchResourceLabelMutation,
  useRemoveResourceAnnotationMutation,
  useRemoveResourceLabelMutation,
} from "@/lib/sealos/k8s/k8s-mutation";
import {
  getKubeconfig,
  getNamespaceFromKubeconfig,
} from "@/lib/sealos/k8s/k8s-utils";
import type { User } from "@/payload-types";
import { deleteAllResourcesInGraph } from "./graph-utils";

// Add resource to graph by adding graphName label
export function useAddResourceToGraphMutation() {
  const patchLabelMutation = usePatchResourceLabelMutation();

  return useMutation({
    mutationFn: async (params: {
      currentUser: User;
      resourceType: ResourceType;
      resourceName: string;
      graphName: string;
      namespaceOverride?: string;
    }) => {
      return await patchLabelMutation.mutateAsync({
        currentUser: params.currentUser,
        resourceType: params.resourceType,
        resourceName: params.resourceName,
        labelKey: GRAPH_NAME_LABEL_KEY,
        labelValue: params.graphName,
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

// Create graph with existing resources by adding graph labels
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

      // Collect all label update promises
      const labelPromises: Promise<unknown>[] = [];

      // Iterate through each resource type and add labels
      for (const [resourceType, resourceNames] of Object.entries(resources)) {
        if (Array.isArray(resourceNames)) {
          for (const resourceName of resourceNames) {
            labelPromises.push(
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

      // Execute all label updates in parallel
      await Promise.all(labelPromises);

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

// Delete all resources in a graph
export function useDeleteAllGraphResourcesMutation() {
  return useMutation({
    mutationFn: async (params: {
      currentUser: User;
      graphName: string;
      graphResources: { [resourceKind: string]: string[] };
      regionUrl: string;
    }) => {
      return await deleteAllResourcesInGraph(
        params.graphName,
        params.graphResources,
        params.currentUser,
        params.regionUrl
      );
    },
  });
}

// Erase graph edges annotation and graph name label from a resource
export function useRemoveGraphResourceMutation() {
  const removeAnnotationMutation = useRemoveResourceAnnotationMutation();
  const removeLabelMutation = useRemoveResourceLabelMutation();

  return useMutation({
    mutationFn: async (params: {
      currentUser: User;
      resourceType: ResourceType;
      resourceName: string;
      namespaceOverride?: string;
    }) => {
      // Remove the graph edges annotation
      await removeAnnotationMutation.mutateAsync({
        currentUser: params.currentUser,
        resourceType: params.resourceType,
        resourceName: params.resourceName,
        annotationKey: GRAPH_EDGES_ANNOTATION_KEY,
        namespaceOverride: params.namespaceOverride,
      });
      // Remove the graph name label
      await removeLabelMutation.mutateAsync({
        currentUser: params.currentUser,
        resourceType: params.resourceType,
        resourceName: params.resourceName,
        labelKey: GRAPH_NAME_LABEL_KEY,
        namespaceOverride: params.namespaceOverride,
      });
      return { success: true };
    },
  });
}

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
      return await k8sDeleteGraphByRemovingLabels(
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
