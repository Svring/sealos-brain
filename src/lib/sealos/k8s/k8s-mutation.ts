"use client";

import { getNamespaceFromKubeconfig, getKubeconfig } from "./k8s-utils";
import {
  patchClusterAnnotation,
  patchObjectStorageBucketAnnotation,
  patchDevboxAnnotation,
} from "./k8s-actions";
import { useMutation } from "@tanstack/react-query";

export function usePatchClusterAnnotationMutation() {
  return useMutation({
    mutationFn: async (params: {
      currentUser: any;
      clusterName: string;
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

      return patchClusterAnnotation(
        kubeconfig,
        params.clusterName,
        params.annotationKey,
        params.annotationValue,
        namespace
      );
    },
  });
}

export function usePatchObjectStorageBucketAnnotationMutation() {
  return useMutation({
    mutationFn: async (params: {
      currentUser: any;
      bucketName: string;
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

      return patchObjectStorageBucketAnnotation(
        kubeconfig,
        params.bucketName,
        params.annotationKey,
        params.annotationValue,
        namespace
      );
    },
  });
}

export function usePatchDevboxAnnotationMutation() {
  return useMutation({
    mutationFn: async (params: {
      currentUser: any;
      devboxName: string;
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

      return patchDevboxAnnotation(
        kubeconfig,
        params.devboxName,
        params.annotationKey,
        params.annotationValue,
        namespace
      );
    },
  });
}
