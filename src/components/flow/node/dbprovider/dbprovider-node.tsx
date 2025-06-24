import { useNodeId } from "@xyflow/react";
import Image from "next/image";
// import DBProviderDetails from "./detail/dbprovider-detail-view";
import { getDBTypeIcon } from "@/lib/sealos/dbprovider/dbprovider-transform";
import BaseNode from "../base-node";

export interface DBProviderNodeData {
  id: string;
  state: "Running" | "Stopped" | "Unknown" | "Creating" | "Failed";
  dbType: string;
  dbName: string;
  dbVersion?: string;
  replicas?: number;
  onClick?: (event: React.MouseEvent) => void;
  isSelected?: boolean;
}

export default function DBProviderNode({ data }: { data: DBProviderNodeData }) {
  const nodeId = useNodeId();

  const { state, dbType, dbName, dbVersion, replicas, onClick, isSelected } =
    data;

  const stateColorMap: Record<DBProviderNodeData["state"], string> = {
    Running: "bg-green-100 text-green-800",
    Stopped: "bg-red-100 text-red-800",
    Creating: "bg-blue-100 text-blue-800",
    Failed: "bg-red-100 text-red-800",
    Unknown: "bg-yellow-100 text-yellow-800",
  };

  const stateColorClass = stateColorMap[state];

  // Get appropriate icon for the database type
  const dbIcon = getDBTypeIcon(dbType);

  return (
    <>
      <BaseNode
        content={<div>DBProviderDetails</div>}
        id={nodeId}
        isSelected={isSelected}
        onClick={onClick}
      >
        <div className="space-y-4">
          {/* Name and Type */}
          <div className="flex items-center gap-2 truncate font-medium">
            <Image
              alt={dbType}
              className="rounded-lg object-contain"
              height={40}
              onError={(e) => {
                // Fallback to DBProvider logo if specific DB icon not found
                (e.target as HTMLImageElement).src =
                  "https://dbprovider.cloud.sealos.io/logo.svg";
              }}
              src={dbIcon}
              width={40}
            />
            <div className="flex flex-col">
              <span className="truncate text-muted-foreground text-sm">
                DBProvider · {dbType}
              </span>
              <span className="font-bold text-foreground text-md">
                {dbName}
              </span>
            </div>
          </div>

          {/* Database details */}
          <div className="space-y-1">
            {dbVersion && (
              <div className="text-muted-foreground text-xs">
                Version: {dbVersion}
              </div>
            )}
            {replicas && (
              <div className="text-muted-foreground text-xs">
                Replicas: {replicas}
              </div>
            )}
          </div>

          {/* State badge */}
          <div className="flex justify-start">
            <span className={`rounded px-2 py-0.5 text-xs ${stateColorClass}`}>
              {state}
            </span>
          </div>
        </div>
      </BaseNode>
    </>
  );
}
