import { useEffect } from "react";
import { Node, useNodesState } from "@xyflow/react";
import { useQuery } from "@tanstack/react-query";
import { devboxListOptions } from "@/lib/devbox/devbox-query";
import { dbProviderListOptions } from "@/lib/dbprovider/dbprovider-query";
import { transformDevboxListIntoNode } from "@/lib/devbox/devbox-transform";
import {
  transformDBProviderListIntoNode,
  type DBProviderNodeDisplayData,
} from "@/lib/dbprovider/dbprovider-transform";
import { useSealosStore } from "@/store/sealos-store";

import { NodeChange } from "@xyflow/react";

interface UseGraphNodeReturn {
  nodes: Node[];
  setNodes: (nodes: Node[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  isLoading: boolean;
  error: string | null;
}

export function useGraphNode(): UseGraphNodeReturn {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const { regionUrl, currentUser } = useSealosStore();

  // Fetch devbox list
  const {
    data: devboxList,
    isLoading: devboxListLoading,
    error: devboxListError,
  } = useQuery(devboxListOptions(currentUser, regionUrl));

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
  const isLoading = devboxListLoading || dbproviderListLoading;

  // Combined error state
  const error =
    devboxListError?.message || dbproviderListError?.message || null;

  // Transform data into nodes and set them
  useEffect(() => {
    console.log("🔍 Query states:", {
      devbox: {
        loading: devboxListLoading,
        error: devboxListError,
        data: devboxList,
      },
      dbprovider: {
        loading: dbproviderListLoading,
        error: dbproviderListError,
        data: dbproviderList,
      },
      currentUser: currentUser?.id,
      regionUrl,
    });

    const allNodes: Node[] = [];

    // Process devbox nodes
    if (devboxList && devboxList.length > 0) {
      try {
        console.log("🔄 Transforming devbox list to nodes:", devboxList);
        const lightweightData = transformDevboxListIntoNode(devboxList);
        const devboxNodes = lightweightData.map((item, index) => ({
          id: item.id,
          type: "devbox",
          position: { x: 300 + index * 280, y: 200 },
          data: item,
        }));
        allNodes.push(...devboxNodes);
        console.log("✅ Generated devbox nodes:", devboxNodes);
      } catch (error) {
        console.error("❌ Error transforming devbox list to nodes:", error);
      }
    }

    // Process dbprovider nodes (data is already transformed)
    if (dbproviderList && dbproviderList.length > 0) {
      try {
        console.log(
          "🔄 Creating dbprovider nodes from transformed data:",
          dbproviderList
        );
        const dbproviderNodes = dbproviderList.map(
          (item: DBProviderNodeDisplayData, index: number) => ({
            id: item.id,
            type: "dbprovider",
            position: { x: 300 + index * 280, y: 400 }, // Position below devbox nodes
            data: item,
          })
        );
        allNodes.push(...dbproviderNodes);
        console.log("✅ Generated dbprovider nodes:", dbproviderNodes);
      } catch (error) {
        console.error("❌ Error creating dbprovider nodes:", error);
      }
    }

    // Set all nodes at once
    setNodes(allNodes);

    if (allNodes.length === 0) {
      console.log("📭 No nodes found, clearing flow");
    }
  }, [
    devboxList,
    dbproviderList,
    setNodes,
    devboxListLoading,
    dbproviderListLoading,
    devboxListError,
    dbproviderListError,
    currentUser,
    regionUrl,
  ]);

  return {
    nodes,
    setNodes,
    onNodesChange,
    isLoading,
    error,
  };
}
