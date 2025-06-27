import { useNodeId } from "@xyflow/react";
import Image from "next/image";
import BaseNode from "../base-node";

export interface ObjectStorageNodeData {
  id: string;
  name: string;
  crName: string;
  policy: string;
  isComplete: boolean;
  size?: string;
  objects?: number;
  createdAt?: string;
  onClick?: (event: React.MouseEvent) => void;
  isSelected?: boolean;
}

export default function ObjectStorageNode({
  data,
}: {
  data: ObjectStorageNodeData;
}) {
  const nodeId = useNodeId();

  const {
    name,
    crName,
    policy,
    isComplete,
    size,
    objects,
    createdAt,
    onClick,
    isSelected,
  } = data;

  const policyColorMap: Record<string, string> = {
    publicReadwrite: "bg-red-100 text-red-800",
    publicRead: "bg-yellow-100 text-yellow-800",
    private: "bg-green-100 text-green-800",
  };

  const statusColorMap = {
    complete: "bg-green-100 text-green-800",
    incomplete: "bg-yellow-100 text-yellow-800",
  };

  const policyColorClass =
    policyColorMap[policy] || "bg-gray-100 text-gray-800";
  const statusColorClass = isComplete
    ? statusColorMap.complete
    : statusColorMap.incomplete;

  return (
    <>
      <BaseNode
        content={<div>ObjectStorageDetails</div>}
        id={nodeId ?? undefined}
        isSelected={isSelected}
        onClick={onClick}
      >
        <div className="space-y-4">
          {/* Name and Type */}
          <div className="flex items-center gap-2 truncate font-medium">
            <Image
              alt="ObjectStorage"
              className="rounded-lg object-contain"
              height={40}
              onError={(e) => {
                // Fallback to a generic storage icon
                (e.target as HTMLImageElement).src = "/storage-icon.svg";
              }}
              src="https://objectstorageapi.hzh.sealos.run/cyhipdvv-logos/objectstorage.svg"
              width={40}
            />
            <div className="flex flex-col">
              <span className="truncate text-muted-foreground text-sm">
                Object Storage
              </span>
              <span className="font-bold text-foreground text-md">{name}</span>
            </div>
          </div>

          {/* Storage details */}
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">
              CR Name: {crName}
            </div>
            {size && (
              <div className="text-muted-foreground text-xs">Size: {size}</div>
            )}
            {objects !== undefined && (
              <div className="text-muted-foreground text-xs">
                Objects: {objects}
              </div>
            )}
            {createdAt && (
              <div className="text-muted-foreground text-xs">
                Created: {new Date(createdAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Policy and Status badges */}
          <div className="flex flex-wrap justify-start gap-2">
            <span className={`rounded px-2 py-0.5 text-xs ${policyColorClass}`}>
              {policy}
            </span>
            <span className={`rounded px-2 py-0.5 text-xs ${statusColorClass}`}>
              {isComplete ? "Complete" : "Incomplete"}
            </span>
          </div>
        </div>
      </BaseNode>
    </>
  );
}
