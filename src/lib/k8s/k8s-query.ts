"use server";

import {
  KubeConfig,
  CoreV1Api,
  AppsV1Api,
  V1Pod,
  V1Service,
  V1Deployment,
  V1Namespace,
  V1Node,
  V1ConfigMap,
  V1Secret,
} from "@kubernetes/client-node";
import { queryOptions } from "@tanstack/react-query";
import { queryDebugLog } from "@/lib/tracing/query-debug-log";

// Helper function to create KubeConfig from kubeconfig string
function createKubeConfig(kubeconfigString: string): KubeConfig {
  const kc = new KubeConfig();
  kc.loadFromString(kubeconfigString);
  return kc;
}

// Helper function to get kubeconfig from currentUser
function getKubeconfigString(currentUser: any): string {
  const kubeconfig = currentUser?.tokens?.find(
    (t: any) => t.type === "kubeconfig"
  )?.value;
  if (!kubeconfig) {
    throw new Error("Kubeconfig not found in user tokens");
  }
  return kubeconfig;
}

/**
 * Get all pods in a namespace
 */
export function getPodsOptions(
  currentUser: any,
  namespace: string = "default",
  postprocess: (data: V1Pod[]) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["k8s", "pods", namespace, currentUser?.id],
    enabled: !!currentUser,
    queryFn: async (): Promise<V1Pod[]> => {
      queryDebugLog("getPodsOptions", {
        namespace,
        userId: currentUser?.id,
      });

      const kubeconfigString = getKubeconfigString(currentUser);
      const kc = createKubeConfig(kubeconfigString);
      const k8sApi = kc.makeApiClient(CoreV1Api);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const podList = await (k8sApi as any).listNamespacedPod({ namespace });
      return (podList.items ?? podList.body?.items) as V1Pod[];
    },
    select: postprocess,
  });
}

/**
 * Get a specific pod by name
 */
export function getPodByNameOptions(
  currentUser: any,
  podName: string,
  namespace: string = "default",
  postprocess: (data: V1Pod) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["k8s", "pod", podName, namespace, currentUser?.id],
    enabled: !!currentUser && !!podName,
    queryFn: async (): Promise<V1Pod> => {
      queryDebugLog("getPodByNameOptions", {
        podName,
        namespace,
        userId: currentUser?.id,
      });

      const kubeconfigString = getKubeconfigString(currentUser);
      const kc = createKubeConfig(kubeconfigString);
      const k8sApi = kc.makeApiClient(CoreV1Api);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { body: pod } = await (k8sApi as any).readNamespacedPod(
        podName,
        namespace
      );
      return pod as V1Pod;
    },
    select: postprocess,
  });
}

/**
 * Get all services in a namespace
 */
export function getServicesOptions(
  currentUser: any,
  namespace: string = "default",
  postprocess: (data: V1Service[]) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["k8s", "services", namespace, currentUser?.id],
    enabled: !!currentUser,
    queryFn: async (): Promise<V1Service[]> => {
      queryDebugLog("getServicesOptions", {
        namespace,
        userId: currentUser?.id,
      });

      const kubeconfigString = getKubeconfigString(currentUser);
      const kc = createKubeConfig(kubeconfigString);
      const k8sApi = kc.makeApiClient(CoreV1Api);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const serviceList = await (k8sApi as any).listNamespacedService({
        namespace,
      });
      return (serviceList.items ?? serviceList.body?.items) as V1Service[];
    },
    select: postprocess,
  });
}

/**
 * Get all deployments in a namespace
 */
export function getDeploymentsOptions(
  currentUser: any,
  namespace: string = "default",
  postprocess: (data: V1Deployment[]) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["k8s", "deployments", namespace, currentUser?.id],
    enabled: !!currentUser,
    queryFn: async (): Promise<V1Deployment[]> => {
      queryDebugLog("getDeploymentsOptions", {
        namespace,
        userId: currentUser?.id,
      });

      const kubeconfigString = getKubeconfigString(currentUser);
      const kc = createKubeConfig(kubeconfigString);
      const k8sApi = kc.makeApiClient(AppsV1Api);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const deploymentList = await (k8sApi as any).listNamespacedDeployment({
        namespace,
      });
      return (deploymentList.items ??
        deploymentList.body?.items) as V1Deployment[];
    },
    select: postprocess,
  });
}

/**
 * Get all namespaces
 */
export function getNamespacesOptions(
  currentUser: any,
  postprocess: (data: V1Namespace[]) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["k8s", "namespaces", currentUser?.id],
    enabled: !!currentUser,
    queryFn: async (): Promise<V1Namespace[]> => {
      queryDebugLog("getNamespacesOptions", {
        userId: currentUser?.id,
      });

      const kubeconfigString = getKubeconfigString(currentUser);
      const kc = createKubeConfig(kubeconfigString);
      const k8sApi = kc.makeApiClient(CoreV1Api);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const namespaceList = await (k8sApi as any).listNamespace();
      return (namespaceList.items ??
        namespaceList.body?.items) as V1Namespace[];
    },
    select: postprocess,
  });
}

/**
 * Get all nodes in the cluster
 */
export function getNodesOptions(
  currentUser: any,
  postprocess: (data: V1Node[]) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["k8s", "nodes", currentUser?.id],
    enabled: !!currentUser,
    queryFn: async (): Promise<V1Node[]> => {
      queryDebugLog("getNodesOptions", {
        userId: currentUser?.id,
      });

      const kubeconfigString = getKubeconfigString(currentUser);
      const kc = createKubeConfig(kubeconfigString);
      const k8sApi = kc.makeApiClient(CoreV1Api);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nodeList = await (k8sApi as any).listNode();
      return (nodeList.items ?? nodeList.body?.items) as V1Node[];
    },
    select: postprocess,
  });
}

/**
 * Get all ConfigMaps in a namespace
 */
export function getConfigMapsOptions(
  currentUser: any,
  namespace: string = "default",
  postprocess: (data: V1ConfigMap[]) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["k8s", "configmaps", namespace, currentUser?.id],
    enabled: !!currentUser,
    queryFn: async (): Promise<V1ConfigMap[]> => {
      queryDebugLog("getConfigMapsOptions", {
        namespace,
        userId: currentUser?.id,
      });

      const kubeconfigString = getKubeconfigString(currentUser);
      const kc = createKubeConfig(kubeconfigString);
      const k8sApi = kc.makeApiClient(CoreV1Api);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const configMapList = await (k8sApi as any).listNamespacedConfigMap({
        namespace,
      });
      return (configMapList.items ??
        configMapList.body?.items) as V1ConfigMap[];
    },
    select: postprocess,
  });
}

/**
 * Get all Secrets in a namespace
 */
export function getSecretsOptions(
  currentUser: any,
  namespace: string = "default",
  postprocess: (data: V1Secret[]) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["k8s", "secrets", namespace, currentUser?.id],
    enabled: !!currentUser,
    queryFn: async (): Promise<V1Secret[]> => {
      queryDebugLog("getSecretsOptions", {
        namespace,
        userId: currentUser?.id,
      });

      const kubeconfigString = getKubeconfigString(currentUser);
      const kc = createKubeConfig(kubeconfigString);
      const k8sApi = kc.makeApiClient(CoreV1Api);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const secretList = await (k8sApi as any).listNamespacedSecret({
        namespace,
      });
      return (secretList.items ?? secretList.body?.items) as V1Secret[];
    },
    select: postprocess,
  });
}

/**
 * Get pod logs
 */
export function getPodLogsOptions(
  currentUser: any,
  podName: string,
  namespace: string = "default",
  containerName?: string,
  tailLines: number = 100,
  postprocess: (data: string) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "k8s",
      "pod-logs",
      podName,
      namespace,
      containerName,
      tailLines,
      currentUser?.id,
    ],
    enabled: !!currentUser && !!podName,
    queryFn: async (): Promise<string> => {
      queryDebugLog("getPodLogsOptions", {
        podName,
        namespace,
        containerName,
        tailLines,
        userId: currentUser?.id,
      });

      const kubeconfigString = getKubeconfigString(currentUser);
      const kc = createKubeConfig(kubeconfigString);
      const k8sApi = kc.makeApiClient(CoreV1Api);

      // Using `as any` to accommodate the older client-node signature that returns `{ body: string }`.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { body: logs } = await (k8sApi as any).readNamespacedPodLog(
        podName,
        namespace,
        containerName,
        undefined, // follow
        undefined, // limitBytes
        undefined, // pretty
        undefined, // previous
        undefined, // sinceSeconds
        tailLines,
        undefined // timestamps
      );
      return logs as string;
    },
    select: postprocess,
  });
}

/**
 * Get pods by label selector
 */
export function getPodsByLabelOptions(
  currentUser: any,
  labelSelector: string,
  namespace: string = "default",
  postprocess: (data: V1Pod[]) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "k8s",
      "pods-by-label",
      labelSelector,
      namespace,
      currentUser?.id,
    ],
    enabled: !!currentUser && !!labelSelector,
    queryFn: async (): Promise<V1Pod[]> => {
      queryDebugLog("getPodsByLabelOptions", {
        labelSelector,
        namespace,
        userId: currentUser?.id,
      });

      const kubeconfigString = getKubeconfigString(currentUser);
      const kc = createKubeConfig(kubeconfigString);
      const k8sApi = kc.makeApiClient(CoreV1Api);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const {
        body: { items: pods },
      } = await (k8sApi as any).listNamespacedPod(
        namespace,
        undefined, // pretty
        undefined, // allowWatchBookmarks
        undefined, // _continue
        undefined, // fieldSelector
        labelSelector
      );
      return pods as V1Pod[];
    },
    select: postprocess,
  });
}
