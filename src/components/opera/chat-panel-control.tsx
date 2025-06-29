"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCodeAgent } from "@/context/copilot-state-provider";
import { useGraphsQuery } from "@/lib/graph/graph-query";
import { devboxByNameOptions } from "@/lib/sealos/devbox/devbox-query";
import { transformDevboxAddresses } from "@/lib/sealos/devbox/devbox-transform";
import { useSealosStore } from "@/store/sealos-store";

interface ChatPanelControlProps {
  onGraphChange?: (graphName: string) => void;
  onDevboxChange?: (devboxName: string) => void;
}

export function ChatPanelControl({
  onGraphChange,
  onDevboxChange,
}: ChatPanelControlProps) {
  const { currentUser, regionUrl } = useSealosStore();
  const [selectedGraph, setSelectedGraph] = useState<string>("");
  const [selectedDevbox, setSelectedDevbox] = useState<string>("");

  const { data: allGraphs, isLoading } = useGraphsQuery(currentUser);

  // Query to get devbox addresses when a devbox is selected
  const devboxAddressesQuery = useQuery(
    devboxByNameOptions(
      currentUser,
      regionUrl,
      selectedDevbox,
      transformDevboxAddresses
    )
  );

  const { state, setState } = useCodeAgent();

  // Update code agent state when devbox addresses change
  useEffect(() => {
    if (
      devboxAddressesQuery.data?.devpod_address &&
      devboxAddressesQuery.data.devpod_address !== state.devpod_address
    ) {
      setState({ devpod_address: devboxAddressesQuery.data.devpod_address });
    }
  }, [
    devboxAddressesQuery.data?.devpod_address,
    state.devpod_address,
    setState,
  ]);

  const handleGraphChange = (graphName: string) => {
    setSelectedGraph(graphName);
    setSelectedDevbox(""); // Reset devbox selection when graph changes
    onGraphChange?.(graphName);
  };

  const handleDevboxChange = (devboxName: string) => {
    setSelectedDevbox(devboxName);
    onDevboxChange?.(devboxName);
  };

  // Get devboxes from selected graph
  const selectedGraphDevboxes =
    selectedGraph && allGraphs ? allGraphs[selectedGraph]?.devbox || [] : [];

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 border-border border-b p-2">
        <div className="text-muted-foreground text-sm">Loading graphs...</div>
      </div>
    );
  }

  const graphNames = allGraphs ? Object.keys(allGraphs) : [];

  return (
    <div className="flex items-center gap-2 border-border border-b p-2">
      {/* Graph Selection */}
      <div className="flex items-center gap-1">
        <Select onValueChange={handleGraphChange} value={selectedGraph}>
          <SelectTrigger className="h-7 w-32 text-xs">
            <SelectValue placeholder="Select graph" />
          </SelectTrigger>
          <SelectContent>
            {graphNames.length === 0 ? (
              <SelectItem disabled value="no-graphs">
                No graphs found
              </SelectItem>
            ) : (
              graphNames.map((graphName) => (
                <SelectItem key={graphName} value={graphName}>
                  {graphName}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Devbox Selection */}
      <div className="flex items-center gap-1">
        <Select
          disabled={!selectedGraph || selectedGraphDevboxes.length === 0}
          onValueChange={handleDevboxChange}
          value={selectedDevbox}
        >
          <SelectTrigger className="h-7 w-32 text-xs">
            <SelectValue placeholder="Select devbox" />
          </SelectTrigger>
          <SelectContent>
            {selectedGraphDevboxes.length === 0 ? (
              <SelectItem disabled value="no-devboxes">
                {selectedGraph ? "No devboxes in graph" : "Select graph first"}
              </SelectItem>
            ) : (
              selectedGraphDevboxes.map((devboxName) => (
                <SelectItem key={devboxName} value={devboxName}>
                  {devboxName}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Loading indicator for devbox address */}
      {selectedDevbox && devboxAddressesQuery.isLoading && (
        <div className="text-muted-foreground text-xs">
          Loading devbox address...
        </div>
      )}

      {/* Error display */}
      {selectedDevbox && devboxAddressesQuery.data?.error && (
        <div className="ml-auto text-destructive text-xs">
          Error: {devboxAddressesQuery.data.error}
        </div>
      )}
    </div>
  );
}
