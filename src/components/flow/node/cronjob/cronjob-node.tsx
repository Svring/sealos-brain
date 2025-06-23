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
}

export default function CronJobNode({ data }: { data: CronJobNodeData }) {
  const nodeId = useNodeId();

  const { name, schedule, suspend, concurrencyPolicy, timeZone, image, lastScheduleTime } = data;

  const statusColorMap = {
    active: "bg-green-100 text-green-800",
    suspended: "bg-yellow-100 text-yellow-800",
    unknown: "bg-gray-100 text-gray-800",
  };

  const status = suspend ? "suspended" : "active";
  const statusColorClass = statusColorMap[status];

  return (
    <>
      <BaseNode id={nodeId} content={<div>CronJobDetails</div>}>
        <div className="space-y-4">
          {/* Name and Type */}
          <div className="font-medium truncate flex items-center gap-2">
            <Image
              src="https://cronjob.cloud.sealos.io/logo.svg"
              alt="CronJob"
              className="object-contain rounded-lg"
              width={40}
              height={40}
              onError={(e) => {
                // Fallback to a generic cron icon
                (e.target as HTMLImageElement).src = "/cron-icon.svg";
              }}
            />
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground truncate">
                CronJob
              </span>
              <span className="text-md font-bold text-foreground">
                {name}
              </span>
            </div>
          </div>

          {/* CronJob details */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">
              Schedule: {schedule}
            </div>
            {timeZone && (
              <div className="text-xs text-muted-foreground">
                Timezone: {timeZone}
              </div>
            )}
            {concurrencyPolicy && (
              <div className="text-xs text-muted-foreground">
                Concurrency: {concurrencyPolicy}
              </div>
            )}
            {image && (
              <div className="text-xs text-muted-foreground truncate">
                Image: {image}
              </div>
            )}
            {lastScheduleTime && (
              <div className="text-xs text-muted-foreground">
                Last Run: {new Date(lastScheduleTime).toLocaleString()}
              </div>
            )}
          </div>

          {/* Status badge */}
          <div className="flex justify-start">
            <span className={`px-2 py-0.5 rounded text-xs ${statusColorClass}`}>
              {suspend ? "Suspended" : "Active"}
            </span>
          </div>
        </div>
      </BaseNode>
    </>
  );
}
