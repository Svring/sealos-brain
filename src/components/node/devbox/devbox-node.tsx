import { Handle, Position, useNodeId } from "@xyflow/react";
import Image from "next/image";
import BaseNode from "../base-node";
import DevboxDetails from "./detail/view/devbox-detail-view";
import { DevboxNodeDisplayData } from "@/lib/devbox/devbox-utils";
import { Copy, ExternalLink } from "lucide-react";

export default function DevboxNode({ data }: { data: DevboxNodeDisplayData }) {
  const nodeId = useNodeId();

  const { name = "Devbox", state = "Unknown", iconId, url, devboxName } = data;

  // Determine badge color based on state
  const stateColorClass =
    state === "Running"
      ? "bg-green-100 text-green-800"
      : state === "Stopped"
        ? "bg-red-100 text-red-800"
        : state === "Creating"
          ? "bg-blue-100 text-blue-800"
          : "bg-yellow-100 text-yellow-800";

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (url) {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <>
      <BaseNode id={nodeId} details={<DevboxDetails devboxName={devboxName} />}>
        <div className="space-y-4">
          {/* Name */}
          <p className="font-medium truncate flex items-center gap-2">
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
              <span className="text-md font-bold text-foreground">{devboxName}</span>
            </div>
          </p>

          {/* URL */}
          {url ? (
            <div className="flex gap-2 text-base">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-muted-foreground hover:underline flex items-center gap-1 transition-colors"
                title="Visit URL"
                onClick={(e) => e.stopPropagation()}
              >
                <span>Public Address</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={handleCopyUrl}
                className="p-1 hover:bg-muted rounded-md transition-colors"
                title="Copy URL"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-base text-muted-foreground text-center">Loading URL...</div>
          )}

          {/* State badge */}
          <div className="flex justify-start">
            <span
              className={`px-2 py-0.5 rounded text-xs ${stateColorClass}`}
            >
              {state}
            </span>
          </div>
        </div>
      </BaseNode>
      {/* Handles */}
      {/* <Handle
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
      /> */}
    </>
  );
}
