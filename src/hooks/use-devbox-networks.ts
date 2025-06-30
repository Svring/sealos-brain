import { useQueries } from "@tanstack/react-query";
import type { Node } from "@xyflow/react";
import { useMemo } from "react";
import { devboxByNameOptions } from "@/lib/sealos/devbox/devbox-query";
import type { User } from "@/payload-types";
import { useSealosStore } from "@/store/sealos-store";

interface DevboxNetworkData {
  portName: string;
  port: number;
  protocol: string;
  networkName: string;
  openPublicDomain: boolean;
  publicDomain: string;
  customDomain: string;
}

interface DevboxDetailResponse {
  networks: DevboxNetworkData[];
}

interface UseDevboxNetworksReturn {
  networkNodes: Node[];
  isLoading: boolean;
}

/**
 * Hook to fetch devbox details and create network nodes for public domains
 * Only creates network nodes for ports with openPublicDomain: true
 */
export function useDevboxNetworks(
  devboxNames: string[],
  currentUser: User | null
): UseDevboxNetworksReturn {
  const { regionUrl } = useSealosStore();

  // Fetch details for all devboxes only if user is available
  const devboxDetailQueries = useQueries({
    queries: devboxNames.map((devboxName) =>
      devboxByNameOptions(currentUser as User, regionUrl, devboxName)
    ),
  });

  // Create network nodes from devbox network data
  const networkNodes = useMemo(() => {
    // Return empty array if no user
    if (!currentUser || devboxNames.length === 0) {
      return [];
    }

    const nodes: Node[] = [];
    let globalNetworkIndex = 0;

    for (const [queryIndex, query] of devboxDetailQueries.entries()) {
      const devboxName = devboxNames[queryIndex];

      if (!query.data || query.isError) {
        continue;
      }

      const response = query.data as DevboxDetailResponse;
      const networks = response.networks || [];

      // Filter networks with public domains and create nodes
      const publicNetworks = networks.filter((net) => net.openPublicDomain);

      for (const network of publicNetworks) {
        // Position network nodes in a separate area to avoid overlap with resource nodes
        // Use a predictable positioning that works with both grid and automatic layouts
        const baseOffsetX = 350; // Offset network nodes to the right of main resources
        const networkSpacingX = 280;
        const networkSpacingY = 150;

        // Calculate position based on global network index for consistent spacing
        const col = globalNetworkIndex % 3; // 3 columns for network nodes
        const row = Math.floor(globalNetworkIndex / 3);

        const x = baseOffsetX + col * networkSpacingX;
        const y = row * networkSpacingY;

        nodes.push({
          id: `network-${devboxName}-${network.portName}`,
          type: "network",
          position: { x, y },
          data: {
            ...network,
            devboxName, // Add reference to parent devbox
          },
        });

        globalNetworkIndex++;
      }
    }

    return nodes;
  }, [devboxDetailQueries, devboxNames, currentUser]);

  // Determine loading state - only loading if we have a user and queries are running
  const isLoading = currentUser
    ? devboxDetailQueries.some((query) => query.isLoading)
    : false;

  return {
    networkNodes,
    isLoading,
  };
}
