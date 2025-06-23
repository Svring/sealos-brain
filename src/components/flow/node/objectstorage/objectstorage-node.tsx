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
}

export default function ObjectStorageNode({ data }: { data: ObjectStorageNodeData }) {
  const nodeId = useNodeId();

  const { name, crName, policy, isComplete, size, objects, createdAt } = data;

  const policyColorMap: Record<string, string> = {
    publicReadwrite: "bg-red-100 text-red-800",
    publicRead: "bg-yellow-100 text-yellow-800",
    private: "bg-green-100 text-green-800",
  };

  const statusColorMap = {
    complete: "bg-green-100 text-green-800",
    incomplete: "bg-yellow-100 text-yellow-800",
  };

  const policyColorClass = policyColorMap[policy] || "bg-gray-100 text-gray-800";
  const statusColorClass = isComplete ? statusColorMap.complete : statusColorMap.incomplete;

  return (
    <>
      <BaseNode id={nodeId} content={<div>ObjectStorageDetails</div>}>
        <div className="space-y-4">
          {/* Name and Type */}
          <div className="font-medium truncate flex items-center gap-2">
            <Image
              src="https://objectstorage.cloud.sealos.io/logo.svg"
              alt="ObjectStorage"
              className="object-contain rounded-lg"
              width={40}
              height={40}
              onError={(e) => {
                // Fallback to a generic storage icon
                (e.target as HTMLImageElement).src = "/storage-icon.svg";
              }}
            />
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground truncate">
                Object Storage
              </span>
              <span className="text-md font-bold text-foreground">
                {name}
              </span>
            </div>
          </div>

          {/* Storage details */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">
              CR Name: {crName}
            </div>
            {size && (
              <div className="text-xs text-muted-foreground">
                Size: {size}
              </div>
            )}
            {objects !== undefined && (
              <div className="text-xs text-muted-foreground">
                Objects: {objects}
              </div>
            )}
            {createdAt && (
              <div className="text-xs text-muted-foreground">
                Created: {new Date(createdAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Policy and Status badges */}
          <div className="flex justify-start gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-xs ${policyColorClass}`}>
              {policy}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs ${statusColorClass}`}>
              {isComplete ? "Complete" : "Incomplete"}
            </span>
          </div>
        </div>
      </BaseNode>
    </>
  );
}
