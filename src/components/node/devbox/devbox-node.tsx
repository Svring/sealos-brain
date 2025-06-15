import { useNodeId } from "@xyflow/react";
import Image from "next/image";
import BaseNode from "../base-node";
import DevboxDetails from "./detail/view/devbox-detail-view";

export interface DevboxNodeData {
  id: string;
  state: "Running" | "Stopped" | "Unknown" | "Creating";
  iconId?: string;
  devboxName: string;
}

export default function DevboxNode({ data }: { data: DevboxNodeData }) {
  const nodeId = useNodeId();

  const { state, iconId, devboxName } = data;

  const stateColorMap: Record<DevboxNodeData["state"], string> = {
    Running: "bg-green-100 text-green-800",
    Stopped: "bg-red-100 text-red-800",
    Creating: "bg-blue-100 text-blue-800",
    Unknown: "bg-yellow-100 text-yellow-800",
  };

  const stateColorClass = stateColorMap[state];

  return (
    <>
      <BaseNode id={nodeId} content={<DevboxDetails devboxName={devboxName} />}>
        <div className="space-y-4">
          {/* Name */}
          <div className="font-medium truncate flex items-center gap-2">
            <Image
              src="https://devbox.bja.sealos.run/logo.svg"
              alt="Devbox"
              className="object-contain rounded-lg"
              width={40}
              height={40}
            />
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground truncate">
                Devbox · {iconId}
              </span>
              <span className="text-md font-bold text-foreground">
                {devboxName}
              </span>
            </div>
          </div>

          {/* State badge */}
          <div className="flex justify-start">
            <span className={`px-2 py-0.5 rounded text-xs ${stateColorClass}`}>
              {state}
            </span>
          </div>
        </div>
      </BaseNode>
    </>
  );
}
