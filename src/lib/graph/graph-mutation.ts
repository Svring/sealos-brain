"use client";

import { useMutation } from "@tanstack/react-query";
import { usePatchResourceAnnotationMutation } from "@/lib/sealos/k8s/k8s-mutation";
import type { ResourceType } from "@/lib/sealos/k8s/k8s-utils";

// Add resource to graph by adding graphName annotation
export function useAddResourceToGraphMutation() {
  const patchAnnotationMutation = usePatchResourceAnnotationMutation();

  return useMutation({
    mutationFn: async (params: {
      currentUser: any;
      resourceType: ResourceType;
      resourceName: string;
      graphName: string;
      namespaceOverride?: string;
    }) => {
      return patchAnnotationMutation.mutateAsync({
        currentUser: params.currentUser,
        resourceType: params.resourceType,
        resourceName: params.resourceName,
        annotationKey: "graphName",
        annotationValue: params.graphName,
        namespaceOverride: params.namespaceOverride,
      });
    },
  });
}
