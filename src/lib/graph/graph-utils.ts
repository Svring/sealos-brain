import type { Edge, Node } from "@xyflow/react";
import { customAlphabet } from "nanoid";
import {
  createMultipleDBs,
  deleteMultipleDBs,
} from "@/lib/sealos/dbprovider/dbprovider-mutation";
import { generateDBFormFromType } from "@/lib/sealos/dbprovider/dbprovider-utils";
import {
  createMultipleDevboxes,
  deleteMultipleDevboxes,
} from "@/lib/sealos/devbox/devbox-mutation";
import {
  GRAPH_EDGES_ANNOTATION_KEY,
  GRAPH_NAME_LABEL_KEY,
  type ResourceType,
} from "@/lib/sealos/k8s/k8s-constant";
import type { GraphResourceGroup } from "@/lib/sealos/k8s/k8s-transform";
import {
  createMultipleObjectStorageBuckets,
  deleteMultipleObjectStorageBuckets,
} from "@/lib/sealos/objectstorage/objectstorage-mutation";
import type { User } from "@/payload-types";

// Type for resource data used in node creation
interface ExistingResource {
  name: string;
  type: ResourceType;
  status?: string;
  annotations?: Record<string, string>;
  labels?: Record<string, string>;
}

// Edge-related interfaces
export interface EdgeConnection {
  name: string;
  type: ResourceType;
}

export interface EdgeInfo {
  in: EdgeConnection[];
  out: EdgeConnection[];
}

export interface ParsedEdge extends Edge {
  sourceResourceType: ResourceType;
  sourceResourceName: string;
  targetResourceType: ResourceType;
  targetResourceName: string;
  createdAt: string;
}

// Create a custom nanoid with lowercase alphabet and numbers for 4 characters
const nanoid4 = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 4);

// Helper function to group resources by graph
export function groupResourcesByGraph(
  allResources: ExistingResource[]
): GraphResourceGroup {
  return allResources.reduce((graphGroups, resource) => {
    const graphName = resource.labels?.[GRAPH_NAME_LABEL_KEY];
    const groupKey = graphName || "nameless";
    graphGroups[groupKey] ??= {};
    graphGroups[groupKey][resource.type] ??= [];
    graphGroups[groupKey][resource.type].push(resource.name);
    return graphGroups;
  }, {} as GraphResourceGroup);
}

// Edge utility functions

/**
 * Create edge from connection info
 */
export function createEdgeFromConnection(
  sourceType: ResourceType,
  sourceName: string,
  targetType: ResourceType,
  targetName: string
): ParsedEdge {
  return {
    id: `${sourceType}-${sourceName}-to-${targetType}-${targetName}`,
    source: `${sourceType}-${sourceName}`,
    target: `${targetType}-${targetName}`,
    type: "step-edge",
    animated: true,
    sourceResourceType: sourceType,
    sourceResourceName: sourceName,
    targetResourceType: targetType,
    targetResourceName: targetName,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Process connections array into edges
 */
export function processConnections(
  connections: EdgeConnection[],
  resourceType: ResourceType,
  resourceName: string,
  isOutgoing: boolean
): ParsedEdge[] {
  const edges: ParsedEdge[] = [];

  for (const connection of connections) {
    if (connection.name && connection.type) {
      if (isOutgoing) {
        edges.push(
          createEdgeFromConnection(
            resourceType,
            resourceName,
            connection.type,
            connection.name
          )
        );
      } else {
        edges.push(
          createEdgeFromConnection(
            connection.type,
            connection.name,
            resourceType,
            resourceName
          )
        );
      }
    }
  }

  return edges;
}

/**
 * Parse edge annotation into edges
 */
export function parseEdgeAnnotation(
  edgesAnnotation: string,
  resourceName: string,
  resourceType: ResourceType
): ParsedEdge[] {
  try {
    const edgeInfo: EdgeInfo = JSON.parse(edgesAnnotation);
    if (!edgeInfo || typeof edgeInfo !== "object") {
      return [];
    }

    const edges: ParsedEdge[] = [];

    if (Array.isArray(edgeInfo.out)) {
      edges.push(
        ...processConnections(edgeInfo.out, resourceType, resourceName, true)
      );
    }

    if (Array.isArray(edgeInfo.in)) {
      edges.push(
        ...processConnections(edgeInfo.in, resourceType, resourceName, false)
      );
    }

    return edges;
  } catch {
    return [];
  }
}

/**
 * Check if resource belongs to specific graph
 */
export function isResourceInGraph(
  resource: ExistingResource,
  specificGraphName?: string
): boolean {
  if (!specificGraphName) {
    return true;
  }
  const resourceGraphName = resource.labels?.[GRAPH_NAME_LABEL_KEY];
  return resourceGraphName === specificGraphName;
}

/**
 * Process edges for a single resource
 */
export function processResourceEdges(resource: ExistingResource): ParsedEdge[] {
  const edgesAnnotation = resource.annotations?.[GRAPH_EDGES_ANNOTATION_KEY];
  if (!edgesAnnotation) {
    return [];
  }

  return parseEdgeAnnotation(
    edgesAnnotation,
    resource.name,
    resource.type as ResourceType
  );
}

/**
 * Check if any edges exist for resources in a specific graph
 */
export function hasEdgesInGraph(
  allResources: ExistingResource[],
  specificGraphName?: string
): boolean {
  if (!allResources.length) {
    return false;
  }

  for (const resource of allResources) {
    if (!isResourceInGraph(resource, specificGraphName)) {
      continue;
    }

    const edgesAnnotation = resource.annotations?.[GRAPH_EDGES_ANNOTATION_KEY];
    if (edgesAnnotation) {
      try {
        const edgeInfo: EdgeInfo = JSON.parse(edgesAnnotation);
        if (
          (Array.isArray(edgeInfo.in) && edgeInfo.in.length > 0) ||
          (Array.isArray(edgeInfo.out) && edgeInfo.out.length > 0)
        ) {
          return true;
        }
      } catch {
        // Ignore parsing errors
      }
    }
  }

  return false;
}

/**
 * Get existing edge info for a resource
 */
export function getExistingEdgeInfo(
  resourceKey: string,
  allResources: ExistingResource[]
): EdgeInfo {
  const [resourceType, ...nameParts] = resourceKey.split("-");
  const resourceName = nameParts.join("-");

  const resource = allResources.find(
    (r) => r.type === resourceType && r.name === resourceName
  );

  if (resource?.annotations?.[GRAPH_EDGES_ANNOTATION_KEY]) {
    try {
      const existing = JSON.parse(
        resource.annotations[GRAPH_EDGES_ANNOTATION_KEY]
      );
      return {
        in: Array.isArray(existing.in) ? existing.in : [],
        out: Array.isArray(existing.out) ? existing.out : [],
      };
    } catch {
      return { in: [], out: [] };
    }
  }

  return { in: [], out: [] };
}

/**
 * Add connection if not exists
 */
export function addConnectionIfNotExists(
  connections: EdgeConnection[],
  newConnection: EdgeConnection
): void {
  const exists = connections.some(
    (conn) =>
      conn.name === newConnection.name && conn.type === newConnection.type
  );
  if (!exists) {
    connections.push(newConnection);
  }
}

/**
 * Remove connection if exists
 */
export function removeConnectionIfExists(
  connections: EdgeConnection[],
  connectionToRemove: EdgeConnection
): void {
  const index = connections.findIndex(
    (conn) =>
      conn.name === connectionToRemove.name &&
      conn.type === connectionToRemove.type
  );
  if (index !== -1) {
    connections.splice(index, 1);
  }
}

// Edge hook utility functions

/**
 * Generic toggle helper for arrays
 */
export function toggle<T>(item: T) {
  return (list: T[]): T[] =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

/**
 * Build display edges with styling for edit mode
 */
export function buildDisplayEdges(
  allResources: ExistingResource[],
  specificGraphName?: string,
  editMode = false,
  selectedEdges: string[] = []
): ParsedEdge[] {
  const allEdges: ParsedEdge[] = [];

  // Process each resource's edges
  for (const resource of allResources) {
    if (!isResourceInGraph(resource, specificGraphName)) {
      continue;
    }
    allEdges.push(...processResourceEdges(resource));
  }

  // Deduplicate edges
  const uniqueEdges = Array.from(
    new Map(allEdges.map((edge) => [edge.id, edge])).values()
  );

  // Apply edit mode styling
  if (editMode) {
    return uniqueEdges.map((edge) => ({
      ...edge,
      style: {
        ...edge.style,
        stroke: selectedEdges.includes(edge.id) ? "#ff6b6b" : undefined,
        strokeWidth: selectedEdges.includes(edge.id) ? 3 : undefined,
      },
      animated: !selectedEdges.includes(edge.id),
    }));
  }

  return uniqueEdges;
}

/**
 * Process edge additions into resource updates map
 */
function processEdgeAdditions(
  draftAdds: Array<{ source: string; target: string }>,
  getInfo: (nodeId: string) => { type: ResourceType; name: string } | null,
  allResources: ExistingResource[],
  resourceUpdates: Map<string, EdgeInfo>
): void {
  for (const { source, target } of draftAdds) {
    const sourceInfo = getInfo(source);
    const targetInfo = getInfo(target);

    if (!(sourceInfo && targetInfo)) {
      continue;
    }

    const sourceKey = `${sourceInfo.type}-${sourceInfo.name}`;
    const targetKey = `${targetInfo.type}-${targetInfo.name}`;

    // Get or initialize edge info
    if (!resourceUpdates.has(sourceKey)) {
      resourceUpdates.set(
        sourceKey,
        getExistingEdgeInfo(sourceKey, allResources)
      );
    }
    if (!resourceUpdates.has(targetKey)) {
      resourceUpdates.set(
        targetKey,
        getExistingEdgeInfo(targetKey, allResources)
      );
    }

    const sourceEdgeInfo = resourceUpdates.get(sourceKey);
    const targetEdgeInfo = resourceUpdates.get(targetKey);

    if (sourceEdgeInfo && targetEdgeInfo) {
      // Add connections
      addConnectionIfNotExists(sourceEdgeInfo.out, {
        name: targetInfo.name,
        type: targetInfo.type,
      });
      addConnectionIfNotExists(targetEdgeInfo.in, {
        name: sourceInfo.name,
        type: sourceInfo.type,
      });
    }
  }
}

/**
 * Process edge deletions into resource updates map
 */
function processEdgeDeletions(
  draftDels: Array<{
    edgeId: string;
    sourceResourceType: ResourceType;
    sourceResourceName: string;
    targetResourceType: ResourceType;
    targetResourceName: string;
  }>,
  allResources: ExistingResource[],
  resourceUpdates: Map<string, EdgeInfo>
): void {
  for (const deletion of draftDels) {
    const sourceKey = `${deletion.sourceResourceType}-${deletion.sourceResourceName}`;
    const targetKey = `${deletion.targetResourceType}-${deletion.targetResourceName}`;

    // Get or initialize edge info
    if (!resourceUpdates.has(sourceKey)) {
      resourceUpdates.set(
        sourceKey,
        getExistingEdgeInfo(sourceKey, allResources)
      );
    }
    if (!resourceUpdates.has(targetKey)) {
      resourceUpdates.set(
        targetKey,
        getExistingEdgeInfo(targetKey, allResources)
      );
    }

    const sourceEdgeInfo = resourceUpdates.get(sourceKey);
    const targetEdgeInfo = resourceUpdates.get(targetKey);

    if (sourceEdgeInfo && targetEdgeInfo) {
      // Remove connections
      removeConnectionIfExists(sourceEdgeInfo.out, {
        name: deletion.targetResourceName,
        type: deletion.targetResourceType,
      });
      removeConnectionIfExists(targetEdgeInfo.in, {
        name: deletion.sourceResourceName,
        type: deletion.sourceResourceType,
      });
    }
  }
}

/**
 * Apply edge diff - handles all mutations and side effects
 */
export async function applyEdgeDiff(diffParams: {
  draftAdds: Array<{ source: string; target: string }>;
  draftDels: Array<{
    edgeId: string;
    sourceResourceType: ResourceType;
    sourceResourceName: string;
    targetResourceType: ResourceType;
    targetResourceName: string;
  }>;
  user: User;
  getInfo: (nodeId: string) => { type: ResourceType; name: string } | null;
  allResources: ExistingResource[];
  addGraphEdgesMutation: {
    mutateAsync: (mutationParams: {
      currentUser: User;
      resourceType: ResourceType;
      resourceName: string;
      graphEdges: string;
    }) => Promise<unknown>;
  };
  queryClient: {
    invalidateQueries: (queryParams: { queryKey: string[] }) => void;
  };
}): Promise<void> {
  const {
    draftAdds,
    draftDels,
    user,
    getInfo,
    allResources,
    addGraphEdgesMutation,
    queryClient,
  } = diffParams;

  if (draftAdds.length === 0 && draftDels.length === 0) {
    return;
  }

  const resourceUpdates = new Map<string, EdgeInfo>();

  // Process additions and deletions
  processEdgeAdditions(draftAdds, getInfo, allResources, resourceUpdates);
  processEdgeDeletions(draftDels, allResources, resourceUpdates);

  // Apply all mutations in parallel
  const mutations = Array.from(resourceUpdates.entries()).map(
    ([resourceKey, edgeInfo]) => {
      const [resourceType, ...nameParts] = resourceKey.split("-");
      const resourceName = nameParts.join("-");

      return addGraphEdgesMutation.mutateAsync({
        currentUser: user,
        resourceType: resourceType as ResourceType,
        resourceName,
        graphEdges: JSON.stringify(edgeInfo),
      });
    }
  );

  await Promise.all(mutations);

  // Invalidate cache
  queryClient.invalidateQueries({ queryKey: ["k8s", "direct"] });
}

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
    const dbForms = dbTypes.map((type) => generateDBFormFromType(type));
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
  // Allow empty arrays or missing values
  if (devbox === undefined || devbox === null) {
    return { isValid: true };
  }

  if (!Array.isArray(devbox)) {
    return {
      isValid: false,
      error: "Devbox must be an array of template names",
    };
  }

  // Allow empty arrays
  return { isValid: true };
}

/**
 * Validate cluster configuration
 */
function validateClusterConfig(cluster: unknown): {
  isValid: boolean;
  error?: string;
} {
  // Allow empty arrays or missing values
  if (cluster === undefined || cluster === null) {
    return { isValid: true };
  }

  if (!Array.isArray(cluster)) {
    return {
      isValid: false,
      error: "Cluster must be an array of database types",
    };
  }

  // Allow empty arrays
  return { isValid: true };
}

/**
 * Validate object storage configuration
 */
function validateObjectStorageConfig(objectstoragebucket: unknown): {
  isValid: boolean;
  error?: string;
} {
  // Allow missing values
  if (objectstoragebucket === undefined || objectstoragebucket === null) {
    return { isValid: true };
  }

  if (typeof objectstoragebucket !== "object") {
    return {
      isValid: false,
      error: "Object storage bucket must be an object with a count property",
    };
  }

  const countValue = (objectstoragebucket as { count?: unknown }).count;

  // Allow missing count (treated as 0)
  if (countValue === undefined || countValue === null) {
    return { isValid: true };
  }

  if (typeof countValue !== "number" || countValue < 0) {
    return {
      isValid: false,
      error: "Object storage bucket count must be a non-negative number",
    };
  }

  return { isValid: true };
}

/**
 * Check if a resource type has actual content
 */
function hasResourceContent(key: string, value: unknown): boolean {
  if (value === undefined || value === null) {
    return false;
  }

  if (key === "devbox" || key === "cluster") {
    return Array.isArray(value) && value.length > 0;
  }

  if (key === "objectstoragebucket") {
    const count = (value as { count?: number }).count;
    return typeof count === "number" && count > 0;
  }

  return false;
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
    const result = validator(value);

    if (!result.isValid && result.error) {
      errors.push(result.error);
    } else if (result.isValid && hasResourceContent(key, value)) {
      hasValidResource = true;
    }
  }

  // Allow configurations with no resources (all empty or missing)
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

  // Remove the requirement for at least one resource type
  // Allow creating graphs with no resources

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

// Node creation helper functions for ReactFlow

/**
 * Create an empty state node for when no resources are available
 */
export const createEmptyStateNode = (graphName: string): Node => ({
  id: "empty-state",
  type: "empty-state",
  position: { x: 0, y: 0 },
  data: { graphName },
  draggable: false,
  selectable: false,
});

/**
 * Create a resource node for ReactFlow
 */
export const createResourceNode = (
  resourceKind: string,
  resourceName: string,
  x: number,
  y: number,
  allResources: ExistingResource[]
): Node => ({
  id: `${resourceKind}-${resourceName}`,
  type: resourceKind,
  position: { x, y },
  data: getNodeDataForResourceType(
    resourceKind,
    resourceName,
    `${resourceKind}-${resourceName}`,
    allResources
  ),
});

/**
 * Create a graph overview node
 */
export const createGraphNode = (
  graphName: string,
  graphResources: Record<string, string[]>,
  graphIndex: number
): Node => ({
  id: `graph-${graphName}`,
  type: "graph",
  position: {
    x: 300 + (graphIndex % 3) * 400,
    y: 200 + Math.floor(graphIndex / 3) * 300,
  },
  data: {
    id: `graph-${graphName}`,
    graphName,
    totalResources: Object.values(graphResources).reduce(
      (acc, resourceList) => acc + resourceList.length,
      0
    ),
    resourceTypes: Object.keys(graphResources),
    resources: graphResources,
  },
});

/**
 * Create a resource type node for overview
 */
export const createResourceTypeNode = (
  graphName: string,
  resourceKind: string,
  resourceNames: string[],
  graphIndex: number,
  resourceTypeIndex: number
): Node => ({
  id: `${graphName}-${resourceKind}`,
  type: resourceKind,
  position: {
    x: 100 + (graphIndex % 3) * 400 + resourceTypeIndex * 100,
    y: 350 + Math.floor(graphIndex / 3) * 300,
  },
  data: {
    id: `${graphName}-${resourceKind}`,
    resourceKind,
    resourceNames,
    graphName,
    count: resourceNames.length,
  },
});

/**
 * Helper function to create proper node data structure for each resource type
 */
function getNodeDataForResourceType(
  resourceKind: string,
  resourceName: string,
  nodeId: string,
  allResources: ExistingResource[]
) {
  // Find the actual resource data
  const resource = allResources.find(
    (r) => r.name === resourceName && r.type === resourceKind
  );

  const baseData = {
    id: nodeId,
    state: mapResourceStatus(resource?.status || "Unknown"),
  };

  switch (resourceKind) {
    case "devbox":
      return {
        ...baseData,
        devboxName: resourceName,
        iconId: "devbox",
      };

    case "cluster":
      // Use DBProvider node data structure for clusters
      return {
        ...baseData,
        dbName: resourceName,
        dbType: "cluster",
        dbVersion: "Unknown", // Would need full resource data to extract this
        replicas: 1, // Would need full resource data to extract this
      };

    case "deployment":
      // Use AppLaunchpad node data structure for deployments
      return {
        ...baseData,
        deploymentName: resourceName,
        replicas: 1, // Would need full resource data to extract this
        availableReplicas: 0, // Would need full resource data to extract this
        image: "Unknown", // Would need full resource data to extract this
      };

    case "cronjob":
      return {
        ...baseData,
        cronJobName: resourceName,
        schedule: "Unknown", // Would need full resource data to extract this
        suspend: false, // Would need full resource data to extract this
      };

    case "objectstoragebucket":
      return {
        ...baseData,
        bucketName: resourceName,
        storageClassName: "Unknown", // Would need full resource data to extract this
      };

    default:
      return {
        ...baseData,
        name: resourceName,
        resourceKind,
      };
  }
}

/**
 * Helper function to map resource status to node state
 */
function mapResourceStatus(status: string): string {
  const statusLower = status.toLowerCase();

  if (
    statusLower.includes("running") ||
    statusLower.includes("ready") ||
    statusLower.includes("available")
  ) {
    return "Running";
  }
  if (statusLower.includes("stopped") || statusLower.includes("terminated")) {
    return "Stopped";
  }
  if (statusLower.includes("creating") || statusLower.includes("pending")) {
    return "Creating";
  }
  if (statusLower.includes("failed") || statusLower.includes("error")) {
    return "Failed";
  }

  return "Unknown";
}

export interface GraphDeletionResult {
  graphName: string;
  totalResourcesDeleted: number;
  results: ResourceCreationResult[];
  summary: string;
}

/**
 * Delete devboxes from graph
 */
async function deleteDevboxesFromGraph(
  devboxNames: string[],
  currentUser: User,
  regionUrl: string
): Promise<ResourceCreationResult> {
  try {
    const devboxResult = await deleteMultipleDevboxes(
      devboxNames,
      currentUser,
      regionUrl
    );

    return {
      resourceType: "devbox",
      successful: devboxResult.successful
        .map((r) => r.result || r.item)
        .filter((name): name is string => Boolean(name)),
      failed: devboxResult.failed.map((r) => r.item),
      summary: devboxResult.summary,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      resourceType: "devbox",
      successful: [],
      failed: devboxNames,
      summary: `Failed to delete devboxes: ${errorMessage}`,
    };
  }
}

/**
 * Delete database clusters from graph
 */
async function deleteClustersFromGraph(
  clusterNames: string[],
  currentUser: User,
  regionUrl: string
): Promise<ResourceCreationResult> {
  try {
    const clusterResult = await deleteMultipleDBs(
      clusterNames,
      currentUser,
      regionUrl
    );

    return {
      resourceType: "cluster",
      successful: clusterResult.successful
        .map((r) => r.result || r.item)
        .filter((name): name is string => Boolean(name)),
      failed: clusterResult.failed.map((r) => r.item),
      summary: clusterResult.summary,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      resourceType: "cluster",
      successful: [],
      failed: clusterNames,
      summary: `Failed to delete database clusters: ${errorMessage}`,
    };
  }
}

/**
 * Delete object storage buckets from graph
 */
async function deleteObjectStorageFromGraph(
  bucketNames: string[],
  currentUser: User,
  regionUrl: string
): Promise<ResourceCreationResult> {
  try {
    const objectStorageResult = await deleteMultipleObjectStorageBuckets(
      bucketNames,
      currentUser,
      regionUrl
    );

    return {
      resourceType: "objectstoragebucket",
      successful: objectStorageResult.successful
        .map((r) => r.result || r.item)
        .filter((name): name is string => Boolean(name)),
      failed: objectStorageResult.failed.map((r) => r.item),
      summary: objectStorageResult.summary,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      resourceType: "objectstoragebucket",
      successful: [],
      failed: bucketNames,
      summary: `Failed to delete object storage buckets: ${errorMessage}`,
    };
  }
}

/**
 * Delete all resources in a graph
 */
export async function deleteAllResourcesInGraph(
  graphName: string,
  graphResources: { [resourceKind: string]: string[] },
  currentUser: User | null,
  regionUrl: string | undefined
): Promise<GraphDeletionResult> {
  if (!currentUser) {
    throw new Error("User not authenticated");
  }

  if (!regionUrl) {
    throw new Error("Region URL is required");
  }

  const results: ResourceCreationResult[] = [];
  let totalDeleted = 0;

  // Delete devboxes if present
  if (graphResources.devbox && graphResources.devbox.length > 0) {
    const devboxResult = await deleteDevboxesFromGraph(
      graphResources.devbox,
      currentUser,
      regionUrl
    );
    results.push(devboxResult);
    totalDeleted += devboxResult.successful.length;
  }

  // Delete clusters (databases) if present
  if (graphResources.cluster && graphResources.cluster.length > 0) {
    const clusterResult = await deleteClustersFromGraph(
      graphResources.cluster,
      currentUser,
      regionUrl
    );
    results.push(clusterResult);
    totalDeleted += clusterResult.successful.length;
  }

  // Delete object storage buckets if present
  if (
    graphResources.objectstoragebucket &&
    graphResources.objectstoragebucket.length > 0
  ) {
    const objectStorageResult = await deleteObjectStorageFromGraph(
      graphResources.objectstoragebucket,
      currentUser,
      regionUrl
    );
    results.push(objectStorageResult);
    totalDeleted += objectStorageResult.successful.length;
  }

  return {
    graphName,
    totalResourcesDeleted: totalDeleted,
    results,
    summary: generateGraphDeletionSummary(graphName, totalDeleted, results),
  };
}

/**
 * Generate summary for graph deletion results
 */
function generateGraphDeletionSummary(
  graphName: string,
  totalResourcesDeleted: number,
  results: ResourceCreationResult[]
): string {
  const successfulResults = results.filter((r) => r.successful.length > 0);
  const failedResults = results.filter((r) => r.failed.length > 0);

  let summary = `Graph '${graphName}' resources deleted: ${totalResourcesDeleted} resources`;

  if (successfulResults.length > 0) {
    summary += "\n\nSuccessful deletions:";
    for (const result of successfulResults) {
      summary += `\n- ${result.resourceType}: ${result.successful.length} resources deleted`;
    }
  }

  if (failedResults.length > 0) {
    summary += "\n\nFailed deletions:";
    for (const result of failedResults) {
      summary += `\n- ${result.resourceType}: ${result.failed.length} resources failed to delete`;
    }
  }

  return summary.trim();
}
