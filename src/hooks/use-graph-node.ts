import { useEffect, useMemo } from "react";
import {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from "@xyflow/react";
import { useQuery, useQueries } from "@tanstack/react-query";
import {
  devboxListOptions,
  devboxByNameOptions,
} from "@/lib/sealos/devbox/devbox-query";
import { dbProviderListOptions } from "@/lib/sealos/dbprovider/dbprovider-query";
import { transformDevboxListIntoNode } from "@/lib/sealos/devbox/devbox-transform";
import {
  transformDBProviderListIntoNode,
  type DBProviderNodeDisplayData,
} from "@/lib/sealos/dbprovider/dbprovider-transform";
import { useSealosStore } from "@/store/sealos-store";
import {
  transformDevboxNetworks,
  transformDevboxListToNames,
} from "@/lib/sealos/devbox/devbox-transform";

import { NodeChange } from "@xyflow/react";

interface UseGraphNodeReturn {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: import("@xyflow/react").EdgeChange[]) => void;
  isLoading: boolean;
  error: string | null;
}

export function useGraphNode(): UseGraphNodeReturn {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { regionUrl, currentUser } = useSealosStore();

  // Fetch devbox list
  const {
    data: devboxList,
    isLoading: devboxListLoading,
    error: devboxListError,
  } = useQuery(devboxListOptions(currentUser, regionUrl));

  // Memoize devbox names for fetching network data
  const devboxNames: string[] = useMemo(() => {
    if (!devboxList) return [];
    try {
      return transformDevboxListToNames(devboxList);
    } catch (e) {
      console.error("Error extracting devbox names", e);
      return [];
    }
  }, [devboxList]);

  // Fetch network details for each devbox
  const networkQueries = useQueries({
    queries: devboxNames.map((name: string) =>
      devboxByNameOptions(currentUser, regionUrl, name, transformDevboxNetworks)
    ),
  });

  // Fetch dbprovider list
  const {
    data: dbproviderList,
    isLoading: dbproviderListLoading,
    error: dbproviderListError,
  } = useQuery(
    dbProviderListOptions(
      currentUser,
      regionUrl,
      transformDBProviderListIntoNode
    )
  );

  // Combined loading state
  const networkLoading = networkQueries.some((q) => q.isLoading);
  const isLoading =
    devboxListLoading || dbproviderListLoading || networkLoading;

  // Combined error state
  const networkError = networkQueries.find((q) => q.error)?.error as
    | Error
    | undefined;
  const error =
    devboxListError?.message ||
    dbproviderListError?.message ||
    networkError?.message ||
    null;

  // Transform data into nodes and set them
  useEffect(() => {
    const allNodes: Node[] = [];
    const allEdges: Edge[] = [];
    const devboxPositionMap: Record<string, { x: number; y: number }> = {};

    if (devboxList && devboxList.length > 0) {
      try {
        const lightweightData = transformDevboxListIntoNode(devboxList);
        const devboxNodes = lightweightData.map((item, index) => {
          const position = { x: 300 + index * 280, y: 200 };
          devboxPositionMap[item.devboxName] = position;
          return {
            id: item.id,
            type: "devbox",
            position,
            sourcePosition: Position.Bottom,
            data: item,
          } as Node;
        });
        allNodes.push(...devboxNodes);
      } catch (error) {
        console.error("Error transforming devbox list to nodes:", error);
      }
    }

    // Stable network data
    const networkData = networkQueries.map((q) => q.data);

    networkData.forEach((networks, queryIdx) => {
      const devboxName = devboxNames[queryIdx];
      const basePosition = devboxPositionMap[devboxName] || {
        x: 300 + queryIdx * 280,
        y: 200,
      };

      (networks || []).forEach((netItem: any, idx: number) => {
        const networkNodeId = `${devboxName}-network-${netItem.port}-${netItem.portName ?? ""}`;
        const node: Node = {
          id: networkNodeId,
          type: "network",
          position: {
            x: basePosition.x,
            y: basePosition.y + 150 + idx * 150,
          },
          targetPosition: Position.Top,
          data: netItem,
        };
        allNodes.push(node);

        // Create edge between devbox and this network node
        const edgeId = `${devboxName}-edge-${netItem.port}-${netItem.portName ?? ""}`;
        allEdges.push({
          id: edgeId,
          source: `devbox-${devboxName}`,
          target: networkNodeId,
          type: "step-edge",
          markerEnd: { type: MarkerType.ArrowClosed },
        } as Edge);
      });
    });

    if (dbproviderList && dbproviderList.length > 0) {
      try {
        const dbproviderNodes = dbproviderList.map(
          (item: DBProviderNodeDisplayData, index: number) => ({
            id: item.id,
            type: "dbprovider",
            position: { x: 300 + index * 280, y: 400 },
            data: item,
          })
        );
        allNodes.push(...dbproviderNodes);
      } catch (error) {
        console.error("Error creating dbprovider nodes:", error);
      }
    }

    setNodes(allNodes);
    setEdges(allEdges);
  }, [
    devboxList,
    dbproviderList,
    setNodes,
    setEdges,
    devboxNames.join(","), // joins to form a stable string
    ...networkQueries.map((q) => q.data), // stable deps
  ]);

  return {
    nodes,
    edges,
    setNodes,
    onNodesChange,
    onEdgesChange,
    isLoading,
    error,
  };
}
