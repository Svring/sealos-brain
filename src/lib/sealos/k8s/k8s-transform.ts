/**
 * Transform function to extract resources by graphName annotation
 * and group them by resource type
 */

import { GRAPH_ANNOTATION_KEY } from "@/lib/sealos/k8s/k8s-constant";

export interface ResourceItem {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    annotations?: {
      [key: string]: string;
    };
    creationTimestamp?: string;
    [key: string]: unknown;
  };
  spec?: {
    state?: string;
    resource?: {
      cpu?: string;
      memory?: string;
    };
    [key: string]: unknown;
  };
  status?: {
    phase?: string;
    [key: string]: unknown;
  };
}

export interface ResourceList {
  apiVersion: string;
  kind: string;
  items: ResourceItem[];
  metadata?: Record<string, unknown>;
}

export interface GraphResourceGroup {
  [graphName: string]: {
    [resourceKind: string]: string[];
  };
}

/**
 * Transform k8s devbox resources into table format
 * Converts direct k8s API response to format expected by the DevboxColumn schema
 */
export function transformK8sDevboxesToTable(resourceList: ResourceList) {
  if (!(resourceList?.items && Array.isArray(resourceList.items))) {
    return [];
  }

  return resourceList.items
    .map((devbox: ResourceItem) => {
      if (!devbox.metadata?.name) {
        return null;
      }

      const devboxName = devbox.metadata.name;

      // Determine status from devbox spec or status
      let status = "Unknown";
      if (devbox.spec?.state) {
        status = devbox.spec.state;
      } else if (devbox.status?.phase) {
        status = devbox.status.phase;
      }

      // Format creation timestamp
      const createdAt = devbox.metadata?.creationTimestamp
        ? new Date(devbox.metadata.creationTimestamp).toLocaleDateString()
        : "Unknown";

      // Calculate estimated cost (placeholder - you may want to implement real cost calculation)
      const cpu = devbox.spec?.resource?.cpu || "0";
      const memory = devbox.spec?.resource?.memory || "0";
      const cost = `$${(
        Number.parseFloat(cpu.replace(/[^0-9.]/g, "")) * 0.001 +
        Number.parseFloat(memory.replace(/[^0-9.]/g, "")) * 0.0001
      ).toFixed(2)}/day`;

      return {
        id: `devbox-${devboxName}`,
        name: devboxName,
        status,
        createdAt,
        cost,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

/**
 * Transform a resource list into grouped resources by graphName annotation
 * @param resourceList - The Kubernetes resource list response
 * @returns Object with graphName as keys and resource kinds with their names as values
 */
export function transformResourcesByGraphName(
  resourceList: ResourceList
): GraphResourceGroup {
  if (!(resourceList?.items && Array.isArray(resourceList.items))) {
    return {};
  }

  const result: GraphResourceGroup = {};

  // Extract the resource kind from the list kind (e.g., "DevboxList" -> "devbox")
  const listKind = resourceList.kind;
  const resourceKind = listKind.replace("List", "").toLowerCase();

  for (const item of resourceList.items) {
    // Check if the resource has a graphName annotation
    const graphName = item.metadata?.annotations?.[GRAPH_ANNOTATION_KEY];

    if (graphName && item.metadata?.name) {
      // Initialize the graph entry if it doesn't exist
      if (!result[graphName]) {
        result[graphName] = {};
      }

      // Initialize the resource kind array if it doesn't exist
      if (!result[graphName][resourceKind]) {
        result[graphName][resourceKind] = [];
      }

      // Add the resource name to the appropriate group
      result[graphName][resourceKind].push(item.metadata.name);
    }
  }

  return result;
}

/**
 * Merge multiple graph resource groups into a single group
 * @param groups - Array of graph resource groups to merge
 * @returns Merged graph resource group
 */
export function mergeGraphResourceGroups(
  groups: GraphResourceGroup[]
): GraphResourceGroup {
  const result: GraphResourceGroup = {};

  for (const group of groups) {
    for (const [graphName, resourceTypes] of Object.entries(group)) {
      if (!result[graphName]) {
        result[graphName] = {};
      }

      for (const [resourceKind, names] of Object.entries(resourceTypes)) {
        if (!result[graphName][resourceKind]) {
          result[graphName][resourceKind] = [];
        }
        result[graphName][resourceKind].push(...names);
      }
    }
  }

  return result;
}
