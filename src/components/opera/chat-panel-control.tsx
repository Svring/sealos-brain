"use client";

import { Key } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCodeAgent } from "@/context/copilot-state-provider";
import { useDevboxSelection } from "@/context/devbox-selection-provider";
import { uploadDevpodReleaseFile } from "@/lib/devpod/devpod-action";
import {
  killDevboxPorts,
  runDevboxNpmDev,
  runDevpodBinary,
  type SSHConfig,
  useDevboxSSHCredentials,
} from "@/lib/devpod/devpod-utils";
import { useGraphsQuery } from "@/lib/graph/graph-query";
import { useSealosStore } from "@/store/sealos-store";

interface ChatPanelControlProps {
  onGraphChange?: (graphName: string) => void;
  onDevboxChange?: (devboxName: string) => void;
}

export function ChatPanelControl({
  onGraphChange,
  onDevboxChange,
}: ChatPanelControlProps) {
  const { currentUser } = useSealosStore();
  const [selectedGraph, setSelectedGraph] = useState<string>("");

  const { data: allGraphs, isLoading } = useGraphsQuery(currentUser);

  const { selectedDevbox, setSelectedDevbox, devpodUrl } = useDevboxSelection();
  const { state, setState } = useCodeAgent();

  // Fetch SSH credentials for the selected devbox
  const sshConfig = useDevboxSSHCredentials(selectedDevbox);

  // Update code agent state when devbox addresses change
  useEffect(() => {
    if (devpodUrl && devpodUrl !== state.devpod_address) {
      setState({ devpod_address: devpodUrl });
    }
  }, [devpodUrl, state.devpod_address, setState]);

  const handleGraphChange = (graphName: string) => {
    setSelectedGraph(graphName);
    setSelectedDevbox(""); // Reset devbox selection when graph changes
    onGraphChange?.(graphName);
  };

  const handleDevboxChange = (devboxName: string) => {
    setSelectedDevbox(devboxName);
    onDevboxChange?.(devboxName);
  };

  const handleControlDevbox = async () => {
    const uploadResult = await uploadDevpodReleaseFile(sshConfig as SSHConfig);
    if (!uploadResult.success) return;

    const killPortsResult = await killDevboxPorts(sshConfig as SSHConfig);
    console.log("Kill ports result", killPortsResult);

    const npmDevResult = await runDevboxNpmDev(sshConfig as SSHConfig);
    console.log("NPM run dev result", npmDevResult);

    const devpodResult = await runDevpodBinary(sshConfig as SSHConfig);
    console.log("Devpod binary result", devpodResult);
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
    <div className="flex items-center gap-1 border-border border-b p-1">
      {/* Graph Selection */}
      <div className="flex items-center gap-1">
        <Select onValueChange={handleGraphChange} value={selectedGraph}>
          <SelectTrigger className="h-7 text-xs" size="sm">
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
          <SelectTrigger className="h-7 text-xs" size="sm">
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

      {/* Show Devbox Secret Button */}
      <div className="ml-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-7 w-7"
                disabled={!selectedDevbox}
                onClick={handleControlDevbox}
                size="icon"
                variant="ghost"
              >
                <Key className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Show Devbox Secret</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
