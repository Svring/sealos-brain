import { useNodeId } from "@xyflow/react";
import Image from "next/image";
import BaseNode from "../base-node";

export interface CronJobNodeData {
  id: string;
  name: string;
  schedule: string;
  suspend?: boolean;
  concurrencyPolicy?: string;
  timeZone?: string;
  image?: string;
  lastScheduleTime?: string;
  namespace?: string;
  onClick?: (event: React.MouseEvent) => void;
  isSelected?: boolean;
}

export default function CronJobNode({ data }: { data: CronJobNodeData }) {
  const nodeId = useNodeId();

  const {
    name,
    schedule,
    suspend,
    concurrencyPolicy,
    timeZone,
    image,
    lastScheduleTime,
    onClick,
    isSelected,
  } = data;

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
        id={nodeId}
        isSelected={isSelected}
        onClick={onClick}
      >
        <div className="space-y-4">
          {/* Name and Type */}
          <div className="flex items-center gap-2 truncate font-medium">
            <Image
              alt="CronJob"
              className="rounded-lg object-contain"
              height={40}
              onError={(e) => {
                // Fallback to a generic cron icon
                (e.target as HTMLImageElement).src = "/cron-icon.svg";
              }}
              src="https://cronjob.cloud.sealos.io/logo.svg"
              width={40}
            />
            <div className="flex flex-col">
              <span className="truncate text-muted-foreground text-sm">
                CronJob
              </span>
              <span className="font-bold text-foreground text-md">{name}</span>
            </div>
          </div>

          {/* CronJob details */}
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">
              Schedule: {schedule}
            </div>
            {timeZone && (
              <div className="text-muted-foreground text-xs">
                Timezone: {timeZone}
              </div>
            )}
            {concurrencyPolicy && (
              <div className="text-muted-foreground text-xs">
                Concurrency: {concurrencyPolicy}
              </div>
            )}
            {image && (
              <div className="truncate text-muted-foreground text-xs">
                Image: {image}
              </div>
            )}
            {lastScheduleTime && (
              <div className="text-muted-foreground text-xs">
                Last Run: {new Date(lastScheduleTime).toLocaleString()}
              </div>
            )}
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
