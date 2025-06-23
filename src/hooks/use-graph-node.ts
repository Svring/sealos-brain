import { useEffect, useMemo } from "react";
import {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from "@xyflow/react";
import { useQuery } from "@tanstack/react-query";
import { useSealosStore } from "@/store/sealos-store";
import {
  directDevboxListOptions,
  directClusterListOptions,
  directDeploymentListOptions,
  directCronJobListOptions,
  directObjectStorageBucketListOptions,
} from "@/lib/sealos/k8s/k8s-query";
import {
  transformResourcesByGraphName,
  mergeGraphResourceGroups,
  type ResourceList,
  type GraphResourceGroup,
} from "@/lib/sealos/k8s/k8s-transform";
import { NodeChange } from "@xyflow/react";

interface UseGraphNodeReturn {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: import("@xyflow/react").EdgeChange[]) => void;
  isLoading: boolean;
  error: string | null;
  mergedGraphs: GraphResourceGroup;
}

export function useGraphNode(specificGraphName?: string): UseGraphNodeReturn {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { currentUser } = useSealosStore();

  // Query all five resource types
  const devboxQuery = useQuery(directDevboxListOptions(currentUser));
  const clusterQuery = useQuery(directClusterListOptions(currentUser));
  const deploymentQuery = useQuery(directDeploymentListOptions(currentUser));
  const cronJobQuery = useQuery(directCronJobListOptions(currentUser));
  const bucketQuery = useQuery(
    directObjectStorageBucketListOptions(currentUser)
  );

  // Combined loading state
  const isLoading = [
    devboxQuery,
    clusterQuery,
    deploymentQuery,
    cronJobQuery,
    bucketQuery,
  ].some((query) => query.isLoading);

  // Combined error state
  const error =
    [
      devboxQuery,
      clusterQuery,
      deploymentQuery,
      cronJobQuery,
      bucketQuery,
    ].find((query) => query.error)?.error?.message || null;

  // Create merged graph list when all queries are complete
  const mergedGraphs = useMemo(() => {
    const allQueriesComplete = [
      devboxQuery,
      clusterQuery,
      deploymentQuery,
      cronJobQuery,
      bucketQuery,
    ].every((query) => !query.isLoading && query.data);

    if (!allQueriesComplete) return {};

    const transformedGroups = [
      transformResourcesByGraphName(devboxQuery.data as ResourceList),
      transformResourcesByGraphName(clusterQuery.data as ResourceList),
      transformResourcesByGraphName(deploymentQuery.data as ResourceList),
      transformResourcesByGraphName(cronJobQuery.data as ResourceList),
      transformResourcesByGraphName(bucketQuery.data as ResourceList),
    ];

    return mergeGraphResourceGroups(transformedGroups);
  }, [
    devboxQuery.data,
    clusterQuery.data,
    deploymentQuery.data,
    cronJobQuery.data,
    bucketQuery.data,
    devboxQuery.isLoading,
    clusterQuery.isLoading,
    deploymentQuery.isLoading,
    cronJobQuery.isLoading,
    bucketQuery.isLoading,
  ]);

  // Transform graphs into nodes and edges for visualization
  useEffect(() => {
    if (!mergedGraphs || Object.keys(mergedGraphs).length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const allNodes: Node[] = [];
    const allEdges: Edge[] = [];

    // If specificGraphName is provided, show only that graph's resources
    if (specificGraphName) {
      const graphResources = mergedGraphs[specificGraphName];
      if (!graphResources) {
        setNodes([]);
        setEdges([]);
        return;
      }

      let xOffset = 300;
      let yOffset = 200;

      // Create nodes for each resource type in the specific graph
      Object.entries(graphResources).forEach(
        ([resourceKind, resourceNames], resourceTypeIndex) => {
          resourceNames.forEach((resourceName, resourceIndex) => {
            const nodeId = `${resourceKind}-${resourceName}`;
            const position = {
              x: xOffset + resourceTypeIndex * 400,
              y: yOffset + resourceIndex * 150,
            };

            // Create node based on resource type
            const node: Node = {
              id: nodeId,
              type: resourceKind, // Use resource kind as node type
              position,
              data: {
                id: nodeId,
                name: resourceName,
                resourceKind,
                graphName: specificGraphName,
                // Add basic display data structure
                [getResourceDisplayKey(resourceKind)]: resourceName,
              },
            };

            allNodes.push(node);

            // Create connections between resources of the same graph
            // Connect to the first resource of the previous type (simple chain pattern)
            if (resourceTypeIndex > 0 && resourceIndex === 0) {
              const prevResourceKind =
                Object.keys(graphResources)[resourceTypeIndex - 1];
              const prevResourceNames = graphResources[prevResourceKind];
              if (prevResourceNames && prevResourceNames.length > 0) {
                const sourceNodeId = `${prevResourceKind}-${prevResourceNames[0]}`;
                const edgeId = `${sourceNodeId}-${nodeId}`;

                allEdges.push({
                  id: edgeId,
                  source: sourceNodeId,
                  target: nodeId,
                  type: "step-edge",
                  markerEnd: { type: MarkerType.ArrowClosed },
                } as Edge);
              }
            }
          });
        }
      );
    } else {
      // Show all graphs as a high-level overview
      let graphIndex = 0;

      Object.entries(mergedGraphs).forEach(([graphName, graphResources]) => {
        const totalResources = Object.values(graphResources).reduce(
          (acc, resourceList) => acc + resourceList.length,
          0
        );

        // Create a graph summary node
        const graphNode: Node = {
          id: `graph-${graphName}`,
          type: "graph", // You'll need to create this node type
          position: {
            x: 300 + (graphIndex % 3) * 400,
            y: 200 + Math.floor(graphIndex / 3) * 300,
          },
          data: {
            id: `graph-${graphName}`,
            graphName,
            totalResources,
            resourceTypes: Object.keys(graphResources),
            resources: graphResources,
          },
        };

        allNodes.push(graphNode);

        // Create resource type nodes for each graph
        let resourceTypeIndex = 0;
        Object.entries(graphResources).forEach(
          ([resourceKind, resourceNames]) => {
            const resourceTypeNodeId = `${graphName}-${resourceKind}`;
            const resourceTypeNode: Node = {
              id: resourceTypeNodeId,
              type: resourceKind,
              position: {
                x: 100 + (graphIndex % 3) * 400 + resourceTypeIndex * 100,
                y: 350 + Math.floor(graphIndex / 3) * 300,
              },
              data: {
                id: resourceTypeNodeId,
                resourceKind,
                resourceNames,
                graphName,
                count: resourceNames.length,
              },
            };

            allNodes.push(resourceTypeNode);

            // Create edge from graph to resource type
            const edgeId = `${graphNode.id}-${resourceTypeNodeId}`;
            allEdges.push({
              id: edgeId,
              source: graphNode.id,
              target: resourceTypeNodeId,
              type: "step-edge",
              markerEnd: { type: MarkerType.ArrowClosed },
            } as Edge);

            resourceTypeIndex++;
          }
        );

        graphIndex++;
      });
    }

    setNodes(allNodes);
    setEdges(allEdges);
  }, [mergedGraphs, specificGraphName, setNodes, setEdges]);

  return {
    nodes,
    edges,
    setNodes,
    onNodesChange,
    onEdgesChange,
    isLoading,
    error,
    mergedGraphs,
  };
}

// Helper function to get the appropriate display key for each resource type
function getResourceDisplayKey(resourceKind: string): string {
  switch (resourceKind) {
    case "devbox":
      return "devboxName";
    case "cluster":
      return "clusterName";
    case "deployment":
      return "deploymentName";
    case "cronjob":
      return "cronJobName";
    case "objectstoragebucket":
      return "bucketName";
    default:
      return "name";
  }
}
