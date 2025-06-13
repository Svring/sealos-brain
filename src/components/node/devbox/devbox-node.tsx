import { Handle, Position, useNodeId } from "@xyflow/react";
import BaseNode from "../base-node";
import DevboxDetails from "./detail/view/devbox-detail-view";
import { DevboxNodeDisplayData } from "@/lib/devbox/devbox-utils";

export default function DevboxNode({ data }: { data: DevboxNodeDisplayData }) {
  const nodeId = useNodeId();

  const {
    name = "Devbox",
    state = "Unknown",
    iconId,
    url,
    devboxName,
  } = data;

  // Determine badge color based on state
  const stateColorClass =
    state === "Running"
      ? "bg-green-100 text-green-800"
      : state === "Stopped"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";

  return (
    <>
      <BaseNode id={nodeId} details={<DevboxDetails devboxName={devboxName} />}>
        <div className="space-y-1">
          {/* Name */}
          <p className="text-sm font-medium truncate flex items-center gap-2">
            {iconId && (
              <img
                src={`/api/public/icon/${iconId}`}
                alt="icon"
                className="w-4 h-4 object-contain"
              />
            )}
            <span>{name}</span>
          </p>

          {/* State badge */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">State:</span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${stateColorClass}`}>
              {state}
            </span>
          </div>

          {/* URL */}
          {url ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">URL:</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 truncate max-w-32"
                title={url}
              >
                {new URL(url).hostname}
              </a>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Loading URL...</div>
          )}
        </div>
      </BaseNode>
      {/* Handles */}
      <Handle
        type="source"
        position={Position.Left}
        id="source-0"
        className="!bg-foreground !h-6 !rounded-lg"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source-1"
        className="!bg-foreground !h-6 !rounded-lg"
      />
    </>
  );
}
