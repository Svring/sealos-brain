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
  onClick?: (event: React.MouseEvent) => void;
  isSelected?: boolean;
}

export default function AIProxyNode({ data }: { data: AIProxyNodeData }) {
  const nodeId = useNodeId();

  const {
    name,
    key,
    status,
    quota,
    used_amount,
    request_count,
    created_at,
    onClick,
    isSelected,
  } = data;

  const statusColorMap: Record<number, { color: string; text: string }> = {
    0: { color: "bg-red-100 text-red-800", text: "Inactive" },
    1: { color: "bg-green-100 text-green-800", text: "Active" },
  };

  const statusInfo = statusColorMap[status] || {
    color: "bg-yellow-100 text-yellow-800",
    text: "Unknown",
  };

  return (
    <>
      <BaseNode
        content={<div>AIProxyDetails</div>}
        id={nodeId ?? undefined}
        isSelected={isSelected}
        onClick={onClick}
      >
        <div className="space-y-4">
          {/* Name and Type */}
          <div className="flex items-center gap-2 truncate font-medium">
            <Image
              alt="AIProxy"
              className="rounded-lg object-contain"
              height={40}
              onError={(e) => {
                // Fallback to a generic AI icon
                (e.target as HTMLImageElement).src = "/ai-icon.svg";
              }}
              src="https://aiproxy.cloud.sealos.io/logo.svg"
              width={40}
            />
            <div className="flex flex-col">
              <span className="truncate text-muted-foreground text-sm">
                AIProxy Token
              </span>
              <span className="font-bold text-foreground text-md">{name}</span>
            </div>
          </div>

          {/* Token details */}
          <div className="space-y-1">
            <div className="truncate text-muted-foreground text-xs">
              Key: {key.substring(0, 20)}...
            </div>
            <div className="text-muted-foreground text-xs">
              Usage: {used_amount} / {quota || "∞"}
            </div>
            <div className="text-muted-foreground text-xs">
              Requests: {request_count}
            </div>
            <div className="text-muted-foreground text-xs">
              Created: {new Date(created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Status badge */}
          <div className="flex justify-start">
            <span className={`rounded px-2 py-0.5 text-xs ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>
        </div>
      </BaseNode>
    </>
  );
}
