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
}

export default function AppLaunchpadNode({ data }: { data: AppLaunchpadNodeData }) {
  const nodeId = useNodeId();

  const { state, deploymentName, replicas, availableReplicas, image } = data;

  const stateColorMap: Record<AppLaunchpadNodeData["state"], string> = {
    Running: "bg-green-100 text-green-800",
    Stopped: "bg-red-100 text-red-800",
    Creating: "bg-blue-100 text-blue-800",
    Failed: "bg-red-100 text-red-800",
    Unknown: "bg-yellow-100 text-yellow-800",
  };

  const stateColorClass = stateColorMap[state];

  return (
    <>
      <BaseNode id={nodeId} content={<div>AppLaunchpadDetails</div>}>
        <div className="space-y-4">
          {/* Name */}
          <div className="font-medium truncate flex items-center gap-2">
            <Image
              src="https://applaunchpad.bja.sealos.run/logo.svg"
              alt="AppLaunchpad"
              className="object-contain rounded-lg"
              width={40}
              height={40}
              onError={(e) => {
                // Fallback to a generic deployment icon
                (e.target as HTMLImageElement).src = "/deployment-icon.svg";
              }}
            />
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground truncate">
                AppLaunchpad · Deployment
              </span>
              <span className="text-md font-bold text-foreground">
                {deploymentName}
              </span>
            </div>
          </div>

          {/* Deployment details */}
          <div className="space-y-1">
            {replicas !== undefined && (
              <div className="text-xs text-muted-foreground">
                Replicas: {availableReplicas || 0}/{replicas}
              </div>
            )}
            {image && (
              <div className="text-xs text-muted-foreground truncate">
                Image: {image}
              </div>
            )}
          </div>

          {/* State badge */}
          <div className="flex justify-start">
            <span className={`px-2 py-0.5 rounded text-xs ${stateColorClass}`}>
              {state}
            </span>
          </div>
        </div>
      </BaseNode>
      {/* Source handle for outgoing connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        className="w-3 h-3 bg-blue-500"
      />
    </>
  );
}
