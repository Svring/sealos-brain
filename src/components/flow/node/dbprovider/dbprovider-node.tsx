import { useNodeId } from "@xyflow/react";
import Image from "next/image";
import BaseNode from "../base-node";
// import DBProviderDetails from "./detail/dbprovider-detail-view";
import { getDBTypeIcon } from "@/lib/dbprovider/dbprovider-transform";

export interface DBProviderNodeData {
  id: string;
  state: "Running" | "Stopped" | "Unknown" | "Creating" | "Failed";
  dbType: string;
  dbName: string;
  dbVersion?: string;
  replicas?: number;
}

export default function DBProviderNode({ data }: { data: DBProviderNodeData }) {
  const nodeId = useNodeId();

  const { state, dbType, dbName, dbVersion, replicas } = data;

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
      <BaseNode id={nodeId} content={<div>DBProviderDetails</div>}>
        <div className="space-y-4">
          {/* Name and Type */}
          <div className="font-medium truncate flex items-center gap-2">
            <Image
              src={dbIcon}
              alt={dbType}
              className="object-contain rounded-lg"
              width={40}
              height={40}
              onError={(e) => {
                // Fallback to DBProvider logo if specific DB icon not found
                (e.target as HTMLImageElement).src =
                  "https://dbprovider.cloud.sealos.io/logo.svg";
              }}
            />
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground truncate">
                DBProvider · {dbType}
              </span>
              <span className="text-md font-bold text-foreground">
                {dbName}
              </span>
            </div>
          </div>

          {/* Database details */}
          <div className="space-y-1">
            {dbVersion && (
              <div className="text-xs text-muted-foreground">
                Version: {dbVersion}
              </div>
            )}
            {replicas && (
              <div className="text-xs text-muted-foreground">
                Replicas: {replicas}
              </div>
            )}
          </div>

          {/* State badge */}
          <div className="flex justify-start">
            <span className={`px-2 py-0.5 rounded text-xs ${stateColorClass}`}>
              {state}
            </span>
          </div>
        </div>
      </BaseNode>
    </>
  );
}
