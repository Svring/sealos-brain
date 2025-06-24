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

export type ResourceType = keyof typeof RESOURCES;

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

// Generic function to list resources by type
export async function listResourcesByType(
  kubeconfig: string,
  resourceType: ResourceType,
  namespace: string = "default"
) {
  try {
    const resource = RESOURCES[resourceType];
    const clients = createApiClients(kubeconfig);

    let res;
    if ("group" in resource && "version" in resource && "plural" in resource) {
      // Custom resource
      res = await clients.customApi.listNamespacedCustomObject({
        group: resource.group,
        version: resource.version,
        namespace: namespace,
        plural: resource.plural,
      });
    } else {
      // Standard Kubernetes resource
      if (resourceType === "deployment") {
        res = await clients.appsApi.listNamespacedDeployment({ namespace });
      } else if (resourceType === "cronjob") {
        res = await clients.batchApi.listNamespacedCronJob({ namespace });
      } else {
        throw new Error(`Unsupported standard resource type: ${resourceType}`);
      }
    }

    // Convert to plain object to avoid serialization issues
    return JSON.parse(JSON.stringify(res));
  } catch (error) {
    console.error(`Error listing ${resourceType}:`, error);
    return { error: `Failed to list ${resourceType}` };
  }
}

// Generic function to patch resource annotation
export async function patchResourceAnnotation(
  kubeconfig: string,
  resourceType: ResourceType,
  resourceName: string,
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

  const patchBody = [
    {
      op: "add",
      path: `/metadata/annotations/${annotationKey}`,
      value: annotationValue,
    },
  ];

  try {
    let result;
    const resource = RESOURCES[resourceType];

    if ("group" in resource && "version" in resource && "plural" in resource) {
      // Custom resource
      const customApi = kc.makeApiClient(CustomObjectsApi);
      result = await customApi.patchNamespacedCustomObject({
        group: resource.group,
        version: resource.version,
        namespace,
        plural: resource.plural,
        name: resourceName,
        body: patchBody,
      });
    } else {
      // Standard Kubernetes resource
      if (resourceType === "deployment") {
        const appsApi = kc.makeApiClient(AppsV1Api);
        result = await appsApi.patchNamespacedDeployment({
          name: resourceName,
          namespace,
          body: patchBody,
        });
      } else if (resourceType === "cronjob") {
        const batchApi = kc.makeApiClient(BatchV1Api);
        result = await batchApi.patchNamespacedCronJob({
          name: resourceName,
          namespace,
          body: patchBody,
        });
      } else {
        throw new Error(`Unsupported standard resource type: ${resourceType}`);
      }
    }

    return {
      annotations: result.metadata?.annotations || {},
      success: true,
      resourceName,
      resourceType,
      annotationKey,
    };
  } catch (error: any) {
    console.error(
      `Error patching annotation on ${resourceType} ${resourceName}:`,
      error
    );
    return {
      success: false,
      error: error.message || `Failed to patch annotation on ${resourceType}`,
      resourceName,
      resourceType,
      annotationKey,
    };
  }
}

// Generic function to remove annotation from a resource
export async function removeResourceAnnotation(
  kubeconfig: string,
  resourceType: ResourceType,
  resourceName: string,
  annotationKey: string,
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

  const patchBody = [
    {
      op: "remove",
      path: `/metadata/annotations/${annotationKey}`,
    },
  ];

  try {
    let result;
    const resource = RESOURCES[resourceType];

    if ("group" in resource && "version" in resource && "plural" in resource) {
      // Custom resource
      const customApi = kc.makeApiClient(CustomObjectsApi);
      result = await customApi.patchNamespacedCustomObject({
        group: resource.group,
        version: resource.version,
        namespace,
        plural: resource.plural,
        name: resourceName,
        body: patchBody,
      });
    } else {
      // Standard Kubernetes resource
      if (resourceType === "deployment") {
        const appsApi = kc.makeApiClient(AppsV1Api);
        result = await appsApi.patchNamespacedDeployment({
          name: resourceName,
          namespace,
          body: patchBody,
        });
      } else if (resourceType === "cronjob") {
        const batchApi = kc.makeApiClient(BatchV1Api);
        result = await batchApi.patchNamespacedCronJob({
          name: resourceName,
          namespace,
          body: patchBody,
        });
      } else {
        throw new Error(`Unsupported standard resource type: ${resourceType}`);
      }
    }

    return {
      success: true,
      resourceName,
      resourceType,
      annotationKey,
    };
  } catch (error: any) {
    console.error(
      `Error removing annotation from ${resourceType} ${resourceName}:`,
      error
    );
    return {
      success: false,
      error:
        error.message || `Failed to remove annotation from ${resourceType}`,
      resourceName,
      resourceType,
      annotationKey,
    };
  }
}

// Function to delete a graph by removing graphName annotation from all resources in it
export async function deleteGraphByRemovingAnnotations(
  kubeconfig: string,
  graphName: string,
  graphResources: { [resourceKind: string]: string[] },
  namespace: string
) {
  const results: Array<{
    success: boolean;
    resourceName: string;
    resourceType: string;
    error?: string;
  }> = [];

  // Process each resource type in the graph
  for (const [resourceKind, resourceNames] of Object.entries(graphResources)) {
    const resourceType = resourceKind as ResourceType;

    // Skip if resource type is not supported
    if (!RESOURCES[resourceType]) {
      console.warn(`Unsupported resource type: ${resourceType}`);
      continue;
    }

    // Remove graphName annotation from each resource
    for (const resourceName of resourceNames) {
      try {
        const result = await removeResourceAnnotation(
          kubeconfig,
          resourceType,
          resourceName,
          "graphName",
          namespace
        );
        results.push(result);
      } catch (error: any) {
        results.push({
          success: false,
          resourceName,
          resourceType,
          error:
            error.message || `Failed to remove annotation from ${resourceName}`,
        });
      }
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  return {
    success: failureCount === 0,
    graphName,
    totalResources: results.length,
    successCount,
    failureCount,
    results,
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
