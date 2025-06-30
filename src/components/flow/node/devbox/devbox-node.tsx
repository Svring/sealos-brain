"use client";

import { useNodeId } from "@xyflow/react";
import Image from "next/image";
import BaseNode from "../base-node";
import DevboxDetails from "./detail/devbox-detail-view";

export interface DevboxNodeData {
  id: string;
  state: "Running" | "Stopped" | "Unknown" | "Creating";
  iconId?: string;
  devboxName: string;
  onClick?: (event: React.MouseEvent) => void;
  isSelected?: boolean;
}

export default function DevboxNode({ data }: { data: DevboxNodeData }) {
  const nodeId = useNodeId();
  const { state, devboxName, onClick, isSelected } = data;

  const stateColorMap: Record<DevboxNodeData["state"], string> = {
    Running: "bg-green-100 text-green-800",
    Stopped: "bg-red-100 text-red-800",
    Creating: "bg-blue-100 text-blue-800",
    Unknown: "bg-yellow-100 text-yellow-800",
  };

  const stateColorClass = stateColorMap[state];

  return (
    <>
      <BaseNode
        content={<DevboxDetails devboxName={devboxName} />}
        id={nodeId ?? undefined}
        isSelected={isSelected}
        onClick={onClick}
      >
        <div className="flex h-full flex-col justify-between">
          {/* Name */}
          <div className="flex items-center gap-2 truncate font-medium">
            <Image
              alt="Devbox"
              className="rounded-lg object-contain"
              height={40}
              src="https://devbox.bja.sealos.run/logo.svg"
              width={40}
            />
            <div className="flex flex-col items-start">
              <span className="truncate text-muted-foreground text-sm">
                Devbox
              </span>
              <span className="truncate font-bold text-foreground text-md">
                {devboxName}
              </span>
            </div>
          </div>

          {/* State badge */}
          <div className="mt-auto flex justify-start">
            <span className={`rounded px-2 py-0.5 text-xs ${stateColorClass}`}>
              {state}
            </span>
          </div>
        </div>
      </BaseNode>
    </>
  );
}
