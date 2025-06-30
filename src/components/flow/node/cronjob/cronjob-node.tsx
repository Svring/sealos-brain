import { useNodeId } from "@xyflow/react";
import Image from "next/image";
import BaseNode from "../base-node";

export interface CronJobNodeData {
  id: string;
  cronJobName: string;
  suspend?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  isSelected?: boolean;
}

export default function CronJobNode({ data }: { data: CronJobNodeData }) {
  const nodeId = useNodeId();

  const { cronJobName, suspend, onClick, isSelected } = data;

  const statusColorMap = {
    active: "bg-green-100 text-green-800",
    suspended: "bg-yellow-100 text-yellow-800",
    unknown: "bg-gray-100 text-gray-800",
  };

  const status = suspend ? "suspended" : "active";
  const statusColorClass = statusColorMap[status];

  return (
    <>
      <BaseNode
        content={<div>CronJobDetails</div>}
        id={nodeId ?? undefined}
        isSelected={isSelected}
        onClick={onClick}
      >
        <div className="flex h-full flex-col justify-between">
          {/* Name and Type */}
          <div className="flex items-center gap-2 truncate font-medium">
            <Image
              alt="CronJob"
              className="rounded-lg object-contain"
              height={40}
              src="https://objectstorageapi.hzh.sealos.run/cyhipdvv-logos/cronjob.svg"
              width={40}
            />
            <div className="flex flex-col items-start">
              <span className="truncate text-muted-foreground text-sm">
                CronJob
              </span>
              <span className="font-bold text-foreground text-md">
                {cronJobName}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex justify-start">
            <span className={`rounded px-2 py-0.5 text-xs ${statusColorClass}`}>
              {suspend ? "Suspended" : "Active"}
            </span>
          </div>
        </div>
      </BaseNode>
    </>
  );
}
