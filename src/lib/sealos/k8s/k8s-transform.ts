/**
 * Transform function to extract resources by graphName annotation
 * and group them by resource type
 */

export interface ResourceItem {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    annotations?: {
      [key: string]: string;
    };
    [key: string]: any;
  };
  spec?: any;
  status?: any;
}

export interface ResourceList {
  apiVersion: string;
  kind: string;
  items: ResourceItem[];
  metadata?: any;
}

export interface GraphResourceGroup {
  [graphName: string]: {
    [resourceKind: string]: string[];
  };
}

/**
 * Transform a resource list into grouped resources by graphName annotation
 * @param resourceList - The Kubernetes resource list response
 * @returns Object with graphName as keys and resource kinds with their names as values
 */
export function transformResourcesByGraphName(
  resourceList: ResourceList
): GraphResourceGroup {
  if (
    !resourceList ||
    !resourceList.items ||
    !Array.isArray(resourceList.items)
  ) {
    return {};
  }

  const result: GraphResourceGroup = {};

  // Extract the resource kind from the list kind (e.g., "DevboxList" -> "devbox")
  const listKind = resourceList.kind;
  const resourceKind = listKind.replace("List", "").toLowerCase();

  resourceList.items.forEach((item: ResourceItem) => {
    // Check if the resource has a graphName annotation
    const graphName = item.metadata?.annotations?.["graphName"];

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
  });

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

  groups.forEach((group) => {
    Object.entries(group).forEach(([graphName, resourceTypes]) => {
      if (!result[graphName]) {
        result[graphName] = {};
      }

      Object.entries(resourceTypes).forEach(([resourceKind, names]) => {
        if (!result[graphName][resourceKind]) {
          result[graphName][resourceKind] = [];
        }
        result[graphName][resourceKind].push(...names);
      });
    });
  });

  return result;
}
