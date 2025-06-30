import { Handle, Position, useNodeId } from "@xyflow/react";
import Image from "next/image";
import BaseNode from "../base-node";
// import AppLaunchpadDetails from "./detail/applaunchpad-detail-view";

export interface AppLaunchpadNodeData {
  id: string;
  state: "Running" | "Stopped" | "Unknown" | "Creating" | "Failed";
  deploymentName: string;
  replicas?: number;
  availableReplicas?: number;
  image?: string;
  onClick?: (event: React.MouseEvent) => void;
  isSelected?: boolean;
}

export default function AppLaunchpadNode({
  data,
}: {
  data: AppLaunchpadNodeData;
}) {
  const nodeId = useNodeId();

  const { state, deploymentName, onClick, isSelected } = data;

  const stateColorMap: Record<AppLaunchpadNodeData["state"], string> = {
    Running: "bg-green-100 text-green-800",
    Stopped: "bg-red-100 text-red-800",
    Creating: "bg-blue-100 text-blue-800",
    Failed: "bg-red-100 text-red-800",
    Unknown: "bg-yellow-100 text-yellow-800",
  };

  const stateColorClass = stateColorMap[state];

  console.log("data", data);

  return (
    <>
      <BaseNode
        content={<div>AppLaunchpadDetails</div>}
        id={nodeId ?? undefined}
        isSelected={isSelected}
        onClick={onClick}
      >
        <div className="flex h-full flex-col justify-between">
          {/* Name */}
          <div className="flex w-full items-center gap-2 truncate font-medium">
            <Image
              alt="AppLaunchpad"
              className="rounded-lg object-contain"
              height={40}
              src="https://applaunchpad.bja.sealos.run/logo.svg"
              width={40}
            />
            <div className="flex w-full flex-col items-start">
              <span className="truncate text-muted-foreground text-sm">
                Deployment
              </span>
              <span className="w-40 overflow-hidden text-ellipsis text-left font-bold text-foreground text-md">
                {deploymentName}
              </span>
            </div>
          </div>

          {/* State badge */}
          <div className="flex justify-start">
            <span className={`rounded px-2 py-0.5 text-xs ${stateColorClass}`}>
              {state}
            </span>
          </div>
        </div>
      </BaseNode>
      {/* Source handle for outgoing connections */}
      <Handle
        className="h-3 w-3 bg-blue-500"
        id="source-bottom"
        position={Position.Bottom}
        type="source"
      />
    </>
  );
}
