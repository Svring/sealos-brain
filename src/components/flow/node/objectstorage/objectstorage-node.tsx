import { useNodeId } from "@xyflow/react";
import Image from "next/image";
import BaseNode from "../base-node";

export interface ObjectStorageNodeData {
  id: string;
  bucketName: string;
  isComplete: boolean;
  onClick?: (event: React.MouseEvent) => void;
  isSelected?: boolean;
}

export default function ObjectStorageNode({
  data,
}: {
  data: ObjectStorageNodeData;
}) {
  const nodeId = useNodeId();

  const { bucketName, onClick, isSelected } = data;

  return (
    <>
      <BaseNode
        content={<div>ObjectStorageDetails</div>}
        id={nodeId ?? undefined}
        isSelected={isSelected}
        onClick={onClick}
      >
        <div className="flex h-full flex-col justify-between">
          {/* Name and Type */}
          <div className="flex items-center gap-2 truncate font-medium">
            <Image
              alt="ObjectStorage"
              className="rounded-lg object-contain"
              height={40}
              src="https://objectstorageapi.hzh.sealos.run/cyhipdvv-logos/objectstorage.svg"
              width={40}
            />
            <div className="flex flex-col items-start">
              <span className="truncate text-muted-foreground text-sm">
                Object Storage
              </span>
              <span className="font-bold text-foreground text-md">
                {bucketName}
              </span>
            </div>
          </div>

          {/* State badge */}
          <div className="flex justify-start">
            <span className="rounded bg-green-100 px-2 py-0.5 text-green-800 text-xs">
              running
            </span>
          </div>
        </div>
      </BaseNode>
    </>
  );
}
