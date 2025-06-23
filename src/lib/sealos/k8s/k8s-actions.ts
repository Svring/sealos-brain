"use server";

import {
  KubeConfig,
  CustomObjectsApi,
  AppsV1Api,
  BatchV1Api,
  CoreV1Api,
} from "@kubernetes/client-node";

// Resource definitions
const RESOURCES = {
  devbox: {
    group: "devbox.sealos.io",
    version: "v1alpha1",
    plural: "devboxes",
  },
  cluster: {
    group: "apps.kubeblocks.io",
    version: "v1alpha1",
    plural: "clusters",
  },
  deployment: {
    // Standard Kubernetes resource
    apiVersion: "apps/v1",
    kind: "Deployment",
  },
  cronjob: {
    // Standard Kubernetes resource
    apiVersion: "batch/v1",
    kind: "CronJob",
  },
  objectstoragebucket: {
    group: "objectstorage.sealos.io",
    version: "v1",
    plural: "objectstoragebuckets",
  },
};

// Helper function to create Kubernetes API clients
function createApiClients(kubeconfig: string) {
  const kc = new KubeConfig();

  // Decode URL-encoded kubeconfig string
  let decodedKubeconfig = kubeconfig;
  try {
    // Check if the string is URL-encoded by looking for encoded characters
    if (kubeconfig.includes("%") || kubeconfig.includes("+")) {
      decodedKubeconfig = decodeURIComponent(kubeconfig);
    }
  } catch (error) {
    console.warn("Failed to decode kubeconfig, using original:", error);
    decodedKubeconfig = kubeconfig;
  }

  kc.loadFromString(decodedKubeconfig);

  return {
    customApi: kc.makeApiClient(CustomObjectsApi),
    appsApi: kc.makeApiClient(AppsV1Api),
    batchApi: kc.makeApiClient(BatchV1Api),
    coreApi: kc.makeApiClient(CoreV1Api),
  };
}

// Read devbox secret by name
export async function readDevboxSecret(
  kubeconfig: string,
  devboxName: string,
  namespace: string = "default"
) {
  try {
    const { coreApi } = createApiClients(kubeconfig);

    const res = await coreApi.readNamespacedSecret({
      namespace: namespace,
      name: devboxName,
    });

    // Convert to plain object to avoid serialization issues
    return JSON.parse(JSON.stringify(res));
  } catch (error) {
    console.error(`Error reading secret for devbox ${devboxName}:`, error);
    return { error: `Failed to read secret for devbox ${devboxName}` };
  }
}

// List Devbox resources
export async function listDevboxes(
  kubeconfig: string,
  namespace: string = "default"
) {
  try {
    const { customApi } = createApiClients(kubeconfig);

    const res = await customApi.listNamespacedCustomObject({
      group: RESOURCES.devbox.group,
      version: RESOURCES.devbox.version,
      namespace: namespace,
      plural: RESOURCES.devbox.plural,
    });

    // Convert to plain object to avoid serialization issues
    return JSON.parse(JSON.stringify(res));
  } catch (error) {
    console.error("Error listing devboxes:", error);
    return { error: "Failed to list devboxes" };
  }
}

// List Cluster resources
export async function listClusters(
  kubeconfig: string,
  namespace: string = "default"
) {
  try {
    const { customApi } = createApiClients(kubeconfig);

    const res = await customApi.listNamespacedCustomObject({
      group: RESOURCES.cluster.group,
      version: RESOURCES.cluster.version,
      namespace: namespace,
      plural: RESOURCES.cluster.plural,
    });

    // Convert to plain object to avoid serialization issues
    return JSON.parse(JSON.stringify(res));
  } catch (error) {
    console.error("Error listing clusters:", error);
    return { error: "Failed to list clusters" };
  }
}

// List Deployment resources
export async function listDeployments(
  kubeconfig: string,
  namespace: string = "default"
) {
  try {
    const { appsApi } = createApiClients(kubeconfig);

    const res = await appsApi.listNamespacedDeployment({ namespace });

    // Convert to plain object to avoid serialization issues
    return JSON.parse(JSON.stringify(res));
  } catch (error) {
    console.error("Error listing deployments:", error);
    return { error: "Failed to list deployments" };
  }
}

// List CronJob resources
export async function listCronJobs(
  kubeconfig: string,
  namespace: string = "default"
) {
  try {
    const { batchApi } = createApiClients(kubeconfig);

    const res = await batchApi.listNamespacedCronJob({ namespace });

    // Convert to plain object to avoid serialization issues
    return JSON.parse(JSON.stringify(res));
  } catch (error) {
    console.error("Error listing cronjobs:", error);
    return { error: "Failed to list cronjobs" };
  }
}

// List ObjectStorageBucket resources
export async function listObjectStorageBuckets(
  kubeconfig: string,
  namespace: string = "default"
) {
  try {
    const { customApi } = createApiClients(kubeconfig);

    const res = await customApi.listNamespacedCustomObject({
      group: RESOURCES.objectstoragebucket.group,
      version: RESOURCES.objectstoragebucket.version,
      namespace: namespace,
      plural: RESOURCES.objectstoragebucket.plural,
    });

    // Convert to plain object to avoid serialization issues
    return JSON.parse(JSON.stringify(res));
  } catch (error) {
    console.error("Error listing object storage buckets:", error);
    return { error: "Failed to list object storage buckets" };
  }
}

// Generic function to list all resources of a specific type
export async function listResourcesByType(
  kubeconfig: string,
  resourceType: keyof typeof RESOURCES,
  namespace: string = "default"
) {
  switch (resourceType) {
    case "devbox":
      return listDevboxes(kubeconfig, namespace);
    case "cluster":
      return listClusters(kubeconfig, namespace);
    case "deployment":
      return listDeployments(kubeconfig, namespace);
    case "cronjob":
      return listCronJobs(kubeconfig, namespace);
    case "objectstoragebucket":
      return listObjectStorageBuckets(kubeconfig, namespace);
    default:
      return { error: `Unsupported resource type: ${resourceType}` };
  }
}

// Legacy function (keeping for backward compatibility)
export async function listCustomResources(currentUser: any) {
  // Extract kubeconfig from user for backward compatibility
  const kubeconfig =
    currentUser.tokens.find((t: any) => t.type === "kubeconfig")?.value || "";
  return listDevboxes(kubeconfig);
}

// Patch annotation for Cluster
export async function patchClusterAnnotation(
  kubeconfig: string,
  clusterName: string,
  annotationKey: string,
  annotationValue: string,
  namespace: string
) {
  const kc = new KubeConfig();
  let decodedKubeconfig = kubeconfig;
  try {
    if (kubeconfig.includes("%") || kubeconfig.includes("+")) {
      decodedKubeconfig = decodeURIComponent(kubeconfig);
    }
  } catch (error) {
    console.warn("Failed to decode kubeconfig, using original:", error);
    decodedKubeconfig = kubeconfig;
  }
  kc.loadFromString(decodedKubeconfig);
  const customApi = kc.makeApiClient(CustomObjectsApi);
  const patchBody = [
    {
      op: "add",
      path: `/metadata/annotations/${annotationKey}`,
      value: annotationValue,
    },
  ];
  const result = await customApi.patchNamespacedCustomObject({
    group: "apps.kubeblocks.io",
    version: "v1alpha1",
    namespace,
    plural: "clusters",
    name: clusterName,
    body: patchBody,
  });
  return {
    annotations: result.metadata?.annotations || annotationKey,
    success: true,
  };
}

// Patch annotation for ObjectStorageBucket
export async function patchObjectStorageBucketAnnotation(
  kubeconfig: string,
  bucketName: string,
  annotationKey: string,
  annotationValue: string,
  namespace: string
) {
  const kc = new KubeConfig();
  let decodedKubeconfig = kubeconfig;
  try {
    if (kubeconfig.includes("%") || kubeconfig.includes("+")) {
      decodedKubeconfig = decodeURIComponent(kubeconfig);
    }
  } catch (error) {
    console.warn("Failed to decode kubeconfig, using original:", error);
    decodedKubeconfig = kubeconfig;
  }
  kc.loadFromString(decodedKubeconfig);
  const customApi = kc.makeApiClient(CustomObjectsApi);
  const patchBody = [
    {
      op: "add",
      path: `/metadata/annotations/${annotationKey}`,
      value: annotationValue,
    },
  ];
  const result = await customApi.patchNamespacedCustomObject({
    group: "objectstorage.sealos.io",
    version: "v1",
    namespace,
    plural: "objectstoragebuckets",
    name: bucketName,
    body: patchBody,
  });
  return {
    annotations: result.metadata?.annotations || annotationKey,
    success: true,
  };
}

// Patch annotation for Devbox
export async function patchDevboxAnnotation(
  kubeconfig: string,
  devboxName: string,
  annotationKey: string,
  annotationValue: string,
  namespace: string
) {
  const kc = new KubeConfig();
  let decodedKubeconfig = kubeconfig;
  try {
    if (kubeconfig.includes("%") || kubeconfig.includes("+")) {
      decodedKubeconfig = decodeURIComponent(kubeconfig);
    }
  } catch (error) {
    console.warn("Failed to decode kubeconfig, using original:", error);
    decodedKubeconfig = kubeconfig;
  }
  kc.loadFromString(decodedKubeconfig);
  const customApi = kc.makeApiClient(CustomObjectsApi);
  const patchBody = [
    {
      op: "add",
      path: `/metadata/annotations/${annotationKey}`,
      value: annotationValue,
    },
  ];
  const result = await customApi.patchNamespacedCustomObject({
    group: "devbox.sealos.io",
    version: "v1alpha1",
    namespace,
    plural: "devboxes",
    name: devboxName,
    body: patchBody,
  });
  return {
    annotations: result.metadata?.annotations || annotationKey,
    success: true,
  };
}
