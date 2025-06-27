import { customAlphabet } from "nanoid";
import { createMultipleDBs } from "@/lib/sealos/dbprovider/dbprovider-mutation";
import { generateDBFormFromType } from "@/lib/sealos/dbprovider/dbprovider-utils";
import { createMultipleDevboxes } from "@/lib/sealos/devbox/devbox-mutation";
import type { ResourceType } from "@/lib/sealos/k8s/k8s-constant";
import { createMultipleObjectStorageBuckets } from "@/lib/sealos/objectstorage/objectstorage-mutation";
import type { User } from "@/payload-types";

// Create a custom nanoid with lowercase alphabet and numbers for 4 characters
const nanoid4 = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 4);

// Interfaces
export interface GraphCreationRequest {
  graphName: string;
  resources: {
    devbox?: string[];
    cluster?: string[];
    objectstoragebucket?: { count: number };
  };
}

export interface ResourceCreationResult {
  resourceType: ResourceType;
  successful: string[];
  failed: string[];
  summary: string;
}

export interface GraphWithResourcesResult {
  graphName: string;
  resourcesCreated: number;
  resourcesAddedToGraph: number;
  results: ResourceCreationResult[];
  summary: string;
}

export type AddResourceToGraphFunction = (params: {
  currentUser: User;
  resourceType: ResourceType;
  resourceName: string;
  graphName: string;
}) => Promise<unknown>;

/**
 * Generate unique graph name with suffix
 */
export function generateUniqueGraphName(baseName: string): string {
  return `${baseName}-${nanoid4()}`;
}

/**
 * Create multiple devboxes from templates
 */
async function createDevboxResources(
  templates: string[],
  currentUser: User | null,
  regionUrl: string | undefined
): Promise<ResourceCreationResult> {
  try {
    const result = await createMultipleDevboxes(
      templates,
      currentUser,
      regionUrl
    );

    return {
      resourceType: "devbox",
      successful: result.successful
        .map((r) => r.result?.devboxName || r.item)
        .filter((name): name is string => Boolean(name)),
      failed: result.failed.map((r) => r.item),
      summary: result.summary,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      resourceType: "devbox",
      successful: [],
      failed: templates,
      summary: `Failed to create devboxes: ${errorMessage}`,
    };
  }
}

/**
 * Create multiple database clusters from types
 */
async function createClusterResources(
  dbTypes: string[],
  currentUser: User | null,
  regionUrl: string | undefined
): Promise<ResourceCreationResult> {
  try {
    const dbForms = dbTypes.map((type) => generateDBFormFromType(type).dbForm);
    const result = await createMultipleDBs(dbForms, currentUser, regionUrl);

    return {
      resourceType: "cluster",
      successful: result.successful
        .map((r) => (typeof r.result === "string" ? r.result : r.item))
        .filter((name): name is string => Boolean(name)),
      failed: result.failed.map((r) => r.item),
      summary: result.summary,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      resourceType: "cluster",
      successful: [],
      failed: dbTypes,
      summary: `Failed to create database clusters: ${errorMessage}`,
    };
  }
}

/**
 * Create multiple object storage buckets
 */
async function createObjectStorageResources(
  count: number,
  currentUser: User | null,
  regionUrl: string | undefined
): Promise<ResourceCreationResult> {
  try {
    const result = await createMultipleObjectStorageBuckets(
      count,
      currentUser,
      regionUrl
    );

    return {
      resourceType: "objectstoragebucket",
      successful: result.successful
        .map((r) => (typeof r.result === "string" ? r.result : r.item))
        .filter((name): name is string => Boolean(name)),
      failed: result.failed.map((r) => r.item),
      summary: result.summary,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      resourceType: "objectstoragebucket",
      successful: [],
      failed: Array.from({ length: count }, (_, i) => `bucket-${i + 1}`),
      summary: `Failed to create object storage buckets: ${errorMessage}`,
    };
  }
}

/**
 * Add resources to graph using mutations
 */
async function addResourcesToGraph(
  graphName: string,
  resourcesByType: { [resourceType in ResourceType]?: string[] },
  addResourceToGraphFn: AddResourceToGraphFunction,
  currentUser: User
): Promise<number> {
  const annotationPromises: Promise<unknown>[] = [];

  for (const [resourceType, resourceNames] of Object.entries(resourcesByType)) {
    if (Array.isArray(resourceNames)) {
      for (const resourceName of resourceNames) {
        annotationPromises.push(
          addResourceToGraphFn({
            currentUser,
            resourceType: resourceType as ResourceType,
            resourceName,
            graphName,
          })
        );
      }
    }
  }

  await Promise.all(annotationPromises);
  return annotationPromises.length;
}

/**
 * Create resources by type
 */
async function createResourcesByType(
  resources: GraphCreationRequest["resources"],
  currentUser: User | null,
  regionUrl: string | undefined
): Promise<{ results: ResourceCreationResult[]; totalCreated: number }> {
  const results: ResourceCreationResult[] = [];
  let totalCreated = 0;

  // Create devboxes if requested
  if (resources.devbox && resources.devbox.length > 0) {
    const devboxResult = await createDevboxResources(
      resources.devbox,
      currentUser,
      regionUrl
    );
    results.push(devboxResult);
    totalCreated += devboxResult.successful.length;
  }

  // Create clusters if requested
  if (resources.cluster && resources.cluster.length > 0) {
    const clusterResult = await createClusterResources(
      resources.cluster,
      currentUser,
      regionUrl
    );
    results.push(clusterResult);
    totalCreated += clusterResult.successful.length;
  }

  // Create object storage buckets if requested
  if (
    resources.objectstoragebucket &&
    resources.objectstoragebucket.count > 0
  ) {
    const objectStorageResult = await createObjectStorageResources(
      resources.objectstoragebucket.count,
      currentUser,
      regionUrl
    );
    results.push(objectStorageResult);
    totalCreated += objectStorageResult.successful.length;
  }

  return { results, totalCreated };
}

/**
 * Generate summary for graph creation results
 */
function generateGraphCreationSummary(
  graphName: string,
  totalResourcesCreated: number,
  results: ResourceCreationResult[]
): string {
  const successfulResults = results.filter((r) => r.successful.length > 0);
  const failedResults = results.filter((r) => r.failed.length > 0);

  let summary = `Graph '${graphName}' created with ${totalResourcesCreated} resources`;

  if (successfulResults.length > 0) {
    summary += "\n\nSuccessful creations:";
    for (const result of successfulResults) {
      summary += `\n- ${result.resourceType}: ${result.successful.length} resources`;
    }
  }

  if (failedResults.length > 0) {
    summary += "\n\nFailed creations:";
    for (const result of failedResults) {
      summary += `\n- ${result.resourceType}: ${result.failed.length} resources failed`;
    }
  }

  return summary.trim();
}

/**
 * Create multiple resources and add them to a graph
 */
export async function createGraphWithNewResources(
  request: GraphCreationRequest,
  currentUser: User | null,
  regionUrl: string | undefined,
  addResourceToGraphFn: AddResourceToGraphFunction
): Promise<GraphWithResourcesResult> {
  if (!currentUser) {
    throw new Error("User not authenticated");
  }

  const { graphName, resources } = request;

  // Create all resources
  const { results, totalCreated } = await createResourcesByType(
    resources,
    currentUser,
    regionUrl
  );

  // Collect all successful resources to add to graph
  const resourcesByType: { [resourceType in ResourceType]?: string[] } = {};
  for (const result of results) {
    if (result.successful.length > 0) {
      resourcesByType[result.resourceType] = result.successful;
    }
  }

  // Add resources to graph
  let resourcesAddedToGraph = 0;
  if (Object.keys(resourcesByType).length > 0) {
    resourcesAddedToGraph = await addResourcesToGraph(
      graphName,
      resourcesByType,
      addResourceToGraphFn,
      currentUser
    );
  }

  return {
    graphName,
    resourcesCreated: totalCreated,
    resourcesAddedToGraph,
    results,
    summary: generateGraphCreationSummary(graphName, totalCreated, results),
  };
}

/**
 * Validate devbox configuration
 */
function validateDevboxConfig(devbox: unknown): {
  isValid: boolean;
  error?: string;
} {
  if (!Array.isArray(devbox) || devbox.length === 0) {
    return {
      isValid: false,
      error: "Devbox must be a non-empty array of template names",
    };
  }
  return { isValid: true };
}

/**
 * Validate cluster configuration
 */
function validateClusterConfig(cluster: unknown): {
  isValid: boolean;
  error?: string;
} {
  if (!Array.isArray(cluster) || cluster.length === 0) {
    return {
      isValid: false,
      error: "Cluster must be a non-empty array of database types",
    };
  }
  return { isValid: true };
}

/**
 * Validate object storage configuration
 */
function validateObjectStorageConfig(objectstoragebucket: unknown): {
  isValid: boolean;
  error?: string;
} {
  if (
    typeof objectstoragebucket !== "object" ||
    !objectstoragebucket ||
    typeof (objectstoragebucket as { count?: unknown }).count !== "number" ||
    (objectstoragebucket as { count: number }).count <= 0
  ) {
    return {
      isValid: false,
      error:
        "Object storage bucket must have a count property with a positive number",
    };
  }
  return { isValid: true };
}

/**
 * Validate resource configuration
 */
function validateResourceConfig(resources: unknown): {
  isValid: boolean;
  errors: string[];
  hasValidResource: boolean;
} {
  const errors: string[] = [];
  let hasValidResource = false;

  if (typeof resources !== "object" || !resources) {
    return {
      isValid: false,
      errors: ["Resources object is required"],
      hasValidResource: false,
    };
  }

  const validators: Record<
    string,
    (value: unknown) => { isValid: boolean; error?: string }
  > = {
    devbox: validateDevboxConfig,
    cluster: validateClusterConfig,
    objectstoragebucket: validateObjectStorageConfig,
  };

  for (const [key, validator] of Object.entries(validators)) {
    const value = (resources as Record<string, unknown>)[key];
    if (value !== undefined) {
      const result = validator(value);
      if (!result.isValid && result.error) {
        errors.push(result.error);
      } else {
        hasValidResource = true;
      }
    }
  }

  return { isValid: errors.length === 0, errors, hasValidResource };
}

/**
 * Validate graph creation request
 */
export function validateGraphCreationRequest(request: {
  graphName?: unknown;
  resources?: unknown;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!request.graphName || typeof request.graphName !== "string") {
    errors.push("Graph name is required and must be a string");
  }

  const resourceValidation = validateResourceConfig(request.resources);
  errors.push(...resourceValidation.errors);

  if (!resourceValidation.hasValidResource) {
    errors.push(
      "At least one resource type (devbox, cluster, or objectstoragebucket) must be specified"
    );
  }

  return { isValid: errors.length === 0, errors };
}

// Graph utility functions for node positioning and layout

/**
 * Calculate optimal grid position for nodes when no edges are present
 */
export function calculateGridPosition(
  index: number,
  totalNodes: number,
  nodeWidth = 300,
  nodeHeight = 200,
  padding = 50
): { x: number; y: number } {
  // Calculate grid dimensions
  const cols = Math.min(6, Math.max(1, Math.ceil(Math.sqrt(totalNodes))));
  const rows = Math.ceil(totalNodes / cols);

  // Calculate position in grid
  const col = index % cols;
  const row = Math.floor(index / cols);

  // Calculate coordinates with centering
  const gridWidth = cols * nodeWidth + (cols - 1) * padding;
  const gridHeight = rows * nodeHeight + (rows - 1) * padding;

  return {
    x: -gridWidth / 2 + nodeWidth / 2 + col * (nodeWidth + padding),
    y: -gridHeight / 2 + nodeHeight / 2 + row * (nodeHeight + padding),
  };
}

/**
 * Calculate circular layout positions for nodes
 */
export function calculateCircularPosition(
  index: number,
  totalNodes: number,
  radius = 300,
  centerX = 0,
  centerY = 0
): { x: number; y: number } {
  const angle = (2 * Math.PI * index) / totalNodes;
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}

/**
 * Calculate hierarchical layout positions for nodes based on type
 */
export function calculateHierarchicalPosition(
  kindIndex: number,
  totalKinds: number,
  resourceIndex: number,
  totalResourcesInKind: number,
  options: {
    levelHeight?: number;
    nodeWidth?: number;
    padding?: number;
  } = {}
): { x: number; y: number } {
  const { levelHeight = 250, nodeWidth = 300, padding = 50 } = options;

  // Position resource types in a horizontal line
  const kindSpacing = nodeWidth + padding * 2;
  const totalKindWidth = totalKinds * kindSpacing;
  const kindStartX = -totalKindWidth / 2 + kindSpacing / 2;
  const kindX = kindStartX + kindIndex * kindSpacing;

  // Position individual resources below their type
  const resourceSpacing = nodeWidth + padding;
  const totalResourceWidth = totalResourcesInKind * resourceSpacing;
  const resourceStartX = kindX - totalResourceWidth / 2 + resourceSpacing / 2;
  const resourceX = resourceStartX + resourceIndex * resourceSpacing;

  return {
    x: resourceX,
    y: levelHeight, // Position resources below their type headers
  };
}

/**
 * Get optimal layout type based on node count and edge presence
 */
export function getOptimalLayoutType(
  nodeCount: number,
  hasEdges: boolean
): "grid" | "circular" | "hierarchical" | "auto" {
  if (hasEdges) {
    return "auto"; // Let the automatic layout algorithm handle positioning
  }

  if (nodeCount <= 8) {
    return "circular";
  }

  if (nodeCount <= 20) {
    return "grid";
  }

  return "hierarchical";
}
