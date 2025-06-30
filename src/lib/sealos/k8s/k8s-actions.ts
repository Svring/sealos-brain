"use server";

import {
  AppsV1Api,
  BatchV1Api,
  CoreV1Api,
  CustomObjectsApi,
  KubeConfig,
} from "@kubernetes/client-node";

// Import the correct keys from k8s-constant
import {
  GRAPH_NAME_LABEL_KEY,
  RESOURCES,
  type ResourceType,
} from "./k8s-constant";

interface ApiClients {
  customApi: CustomObjectsApi;
  appsApi: AppsV1Api;
  batchApi: BatchV1Api;
  coreApi: CoreV1Api;
}

function createKubeConfig(kubeconfig: string): KubeConfig {
  const kc = new KubeConfig();
  kc.loadFromString(kubeconfig);
  return kc;
}

function createApiClients(kc: KubeConfig): ApiClients {
  return {
    customApi: kc.makeApiClient(CustomObjectsApi),
    appsApi: kc.makeApiClient(AppsV1Api),
    batchApi: kc.makeApiClient(BatchV1Api),
    coreApi: kc.makeApiClient(CoreV1Api),
  };
}

export async function getResource(
  kubeconfig: string,
  resourceType: ResourceType,
  resourceName: string,
  namespace = "default"
) {
  try {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const resource = RESOURCES[resourceType];

    if ("group" in resource && resource.group) {
      const result = await clients.customApi.getNamespacedCustomObject({
        group: resource.group,
        version: resource.version || "v1",
        namespace,
        plural: resource.plural || "",
        name: resourceName,
      });
      return JSON.parse(JSON.stringify(result));
    }
    if (resourceType === "deployment") {
      const result = await clients.appsApi.readNamespacedDeployment({
        name: resourceName,
        namespace,
      });
      return JSON.parse(JSON.stringify(result));
    }
    if (resourceType === "cronjob") {
      const result = await clients.batchApi.readNamespacedCronJob({
        name: resourceName,
        namespace,
      });
      return JSON.parse(JSON.stringify(result));
    }
    throw new Error(`Unsupported resource type: ${resourceType}`);
  } catch {
    return { error: `Failed to get ${resourceType} ${resourceName}` };
  }
}

async function patchResource(
  clients: ApiClients,
  resourceType: ResourceType,
  resourceName: string,
  namespace: string,
  patchBody: unknown[]
) {
  const resource = RESOURCES[resourceType];
  if ("group" in resource && resource.group) {
    return clients.customApi.patchNamespacedCustomObject({
      group: resource.group,
      version: resource.version!,
      namespace,
      plural: resource.plural!,
      name: resourceName,
      body: patchBody,
    });
  }
  if (resourceType === "deployment") {
    return clients.appsApi.patchNamespacedDeployment({
      name: resourceName,
      namespace,
      body: patchBody,
    });
  }
  if (resourceType === "cronjob") {
    return clients.batchApi.patchNamespacedCronJob({
      name: resourceName,
      namespace,
      body: patchBody,
    });
  }
  throw new Error(`Unsupported resource type: ${resourceType}`);
}

export async function listResourcesByType(
  kubeconfig: string,
  resourceType: ResourceType,
  namespace = "default"
) {
  try {
    const kc = createKubeConfig(kubeconfig);
    const clients = createApiClients(kc);
    const resource = RESOURCES[resourceType];

    let res: unknown = null;
    if (
      "group" in resource &&
      resource.group &&
      resource.version &&
      resource.plural
    ) {
      res = await clients.customApi.listNamespacedCustomObject({
        group: resource.group,
        version: resource.version,
        namespace,
        plural: resource.plural,
      });
    } else if (resourceType === "deployment") {
      res = await clients.appsApi.listNamespacedDeployment({ namespace });
    } else if (resourceType === "cronjob") {
      res = await clients.batchApi.listNamespacedCronJob({ namespace });
    }

    if (!res) {
      throw new Error(`Unsupported resource type: ${resourceType}`);
    }
    return JSON.parse(JSON.stringify(res));
  } catch {
    return { error: `Failed to list ${resourceType}` };
  }
}

export async function patchResourceAnnotation(
  kubeconfig: string,
  resourceType: ResourceType,
  resourceName: string,
  annotationKey: string,
  annotationValue: string,
  namespace: string
) {
  const kc = createKubeConfig(kubeconfig);
  const clients = createApiClients(kc);

  // Only escape the key for JSON Patch path, not for the actual annotation key
  const encodedAnnotationKey = escapeSlash(annotationKey);

  try {
    const currentResource = await getResource(
      kubeconfig,
      resourceType,
      resourceName,
      namespace
    );
    const patchBody = currentResource.metadata?.annotations
      ? [
          {
            op: "add",
            path: `/metadata/annotations/${encodedAnnotationKey}`,
            value: annotationValue,
          },
        ]
      : [
          {
            op: "add",
            path: "/metadata/annotations",
            value: { [annotationKey]: annotationValue },
          },
        ];

    const result = await patchResource(
      clients,
      resourceType,
      resourceName,
      namespace,
      patchBody
    );

    return {
      annotations: result.metadata?.annotations || {},
      success: true,
      resourceName,
      resourceType,
      annotationKey,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : `Failed to patch annotation on ${resourceType}`,
      resourceName,
      resourceType,
      annotationKey,
    };
  }
}

export async function removeResourceAnnotation(
  kubeconfig: string,
  resourceType: ResourceType,
  resourceName: string,
  annotationKey: string,
  namespace: string
) {
  const kc = createKubeConfig(kubeconfig);
  const clients = createApiClients(kc);

  try {
    // Escape the key for JSON Patch path
    const encodedAnnotationKey = escapeSlash(annotationKey);
    const patchBody = [
      { op: "remove", path: `/metadata/annotations/${encodedAnnotationKey}` },
    ];
    const result = await patchResource(
      clients,
      resourceType,
      resourceName,
      namespace,
      patchBody
    );

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

  for (const [resourceKind, resourceNames] of Object.entries(graphResources)) {
    const resourceType = resourceKind as ResourceType;
    if (!RESOURCES[resourceType]) {
      console.warn(`Unsupported resource type: ${resourceType}`);
      continue;
    }

    for (const resourceName of resourceNames) {
      const result = await removeResourceAnnotation(
        kubeconfig,
        resourceType,
        resourceName,
        GRAPH_NAME_LABEL_KEY,
        namespace
      );
      results.push(result);
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.length - successCount;

  return {
    success: failureCount === 0,
    graphName,
    totalResources: results.length,
    successCount,
    failureCount,
    results,
  };
}

export async function readDevboxSecret(
  kubeconfig: string,
  devboxName: string,
  namespace = "default"
) {
  try {
    const kc = createKubeConfig(kubeconfig);
    const { coreApi } = createApiClients(kc);
    const res = await coreApi.readNamespacedSecret({
      namespace,
      name: devboxName,
    });
    return JSON.parse(JSON.stringify(res));
  } catch (error) {
    console.error(`Error reading secret for devbox ${devboxName}:`, error);
    return { error: `Failed to read secret for devbox ${devboxName}` };
  }
}

// Utility to encode annotation key for JSON patch (convert '/' to '~1')
function escapeSlash(key: string): string {
  return key.replaceAll("/", "~1");
}

/**
 * Returns the current context object (with namespace) from the kubeconfig.
 * @param kubeconfig The kubeconfig string (may be URL-encoded)
 * @returns The current context object, e.g. { name, namespace, user, cluster }
 */
export async function getCurrentContextWithNamespace(
  kubeconfig: string
): Promise<{
  name: string;
  namespace?: string;
  user?: string;
  cluster?: string;
}> {
  const kc = createKubeConfig(kubeconfig);
  const currentContext = kc.getCurrentContext();
  const ctx = kc.getContextObject(currentContext);
  return ctx ?? { name: currentContext };
}

/**
 * Returns the current cluster object from the kubeconfig.
 * @param kubeconfig The kubeconfig string
 * @returns The current cluster object or null if not found
 */
export async function getCurrentCluster(kubeconfig: string) {
  const kc = createKubeConfig(kubeconfig);
  return kc.getCurrentCluster();
}

export async function patchResourceLabel(
  kubeconfig: string,
  resourceType: ResourceType,
  resourceName: string,
  labelKey: string,
  labelValue: string,
  namespace: string
) {
  const kc = createKubeConfig(kubeconfig);
  const clients = createApiClients(kc);

  // Escape the key for JSON Patch path
  const encodedLabelKey = escapeSlash(labelKey);

  try {
    const currentResource = await getResource(
      kubeconfig,
      resourceType,
      resourceName,
      namespace
    );
    const patchBody = currentResource.metadata?.labels
      ? [
          {
            op: "add",
            path: `/metadata/labels/${encodedLabelKey}`,
            value: labelValue,
          },
        ]
      : [
          {
            op: "add",
            path: "/metadata/labels",
            value: { [labelKey]: labelValue },
          },
        ];

    const result = await patchResource(
      clients,
      resourceType,
      resourceName,
      namespace,
      patchBody
    );

    return {
      labels: result.metadata?.labels || {},
      success: true,
      resourceName,
      resourceType,
      labelKey,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : `Failed to patch label on ${resourceType}`,
      resourceName,
      resourceType,
      labelKey,
    };
  }
}

export async function removeResourceLabel(
  kubeconfig: string,
  resourceType: ResourceType,
  resourceName: string,
  labelKey: string,
  namespace: string
) {
  const kc = createKubeConfig(kubeconfig);
  const clients = createApiClients(kc);

  try {
    // Escape the key for JSON Patch path
    const encodedLabelKey = escapeSlash(labelKey);
    const patchBody = [
      { op: "remove", path: `/metadata/labels/${encodedLabelKey}` },
    ];
    const result = await patchResource(
      clients,
      resourceType,
      resourceName,
      namespace,
      patchBody
    );

    return {
      success: true,
      resourceName,
      resourceType,
      labelKey,
    };
  } catch (error: any) {
    console.error(
      `Error removing label from ${resourceType} ${resourceName}:`,
      error
    );
    return {
      success: false,
      error: error.message || `Failed to remove label from ${resourceType}`,
      resourceName,
      resourceType,
      labelKey,
    };
  }
}

export async function deleteGraphByRemovingLabels(
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

  for (const [resourceKind, resourceNames] of Object.entries(graphResources)) {
    const resourceType = resourceKind as ResourceType;
    if (!RESOURCES[resourceType]) {
      console.warn(`Unsupported resource type: ${resourceType}`);
      continue;
    }

    for (const resourceName of resourceNames) {
      const result = await removeResourceLabel(
        kubeconfig,
        resourceType,
        resourceName,
        GRAPH_NAME_LABEL_KEY,
        namespace
      );
      results.push(result);
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.length - successCount;

  return {
    success: failureCount === 0,
    graphName,
    totalResources: results.length,
    successCount,
    failureCount,
    results,
  };
}
