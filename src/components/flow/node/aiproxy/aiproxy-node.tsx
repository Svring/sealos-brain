import { useNodeId } from "@xyflow/react";
import Image from "next/image";
import BaseNode from "../base-node";

export interface AIProxyNodeData {
  id: string;
  name: string;
  key: string;
  status: number;
  quota: number;
  used_amount: number;
  request_count: number;
  created_at: number;
  expired_at: number;
  group?: string;
}

export default function AIProxyNode({ data }: { data: AIProxyNodeData }) {
  const nodeId = useNodeId();

  const { name, key, status, quota, used_amount, request_count, created_at } = data;

  const statusColorMap: Record<number, { color: string; text: string }> = {
    0: { color: "bg-red-100 text-red-800", text: "Inactive" },
    1: { color: "bg-green-100 text-green-800", text: "Active" },
  };

  const statusInfo = statusColorMap[status] || { color: "bg-yellow-100 text-yellow-800", text: "Unknown" };

  return (
    <>
      <BaseNode id={nodeId} content={<div>AIProxyDetails</div>}>
        <div className="space-y-4">
          {/* Name and Type */}
          <div className="font-medium truncate flex items-center gap-2">
            <Image
              src="https://aiproxy.cloud.sealos.io/logo.svg"
              alt="AIProxy"
              className="object-contain rounded-lg"
              width={40}
              height={40}
              onError={(e) => {
                // Fallback to a generic AI icon
                (e.target as HTMLImageElement).src = "/ai-icon.svg";
              }}
            />
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground truncate">
                AIProxy Token
              </span>
              <span className="text-md font-bold text-foreground">
                {name}
              </span>
            </div>
          </div>

          {/* Token details */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground truncate">
              Key: {key.substring(0, 20)}...
            </div>
            <div className="text-xs text-muted-foreground">
              Usage: {used_amount} / {quota || "∞"}
            </div>
            <div className="text-xs text-muted-foreground">
              Requests: {request_count}
            </div>
            <div className="text-xs text-muted-foreground">
              Created: {new Date(created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Status badge */}
          <div className="flex justify-start">
            <span className={`px-2 py-0.5 rounded text-xs ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>
        </div>
      </BaseNode>
    </>
  );
}
