import React from "react";
import { Handle, Position } from "@xyflow/react";

export interface NetworkNodeData {
  portName: string;
  port: number;
  protocol: string;
  networkName: string;
  openPublicDomain: boolean;
  publicDomain: string;
  customDomain: string;
}

export default function NetworkNode({ data }: { data: NetworkNodeData }) {
  const network = data;
  return (
    <>
    <div className="relative p-4 rounded-lg border bg-background shadow-md w-64">
      <div className="mb-2 font-bold text-lg truncate">Network: {network.networkName}</div>
      <div className="text-sm text-muted-foreground mb-1">
        <span className="font-medium">Port Name:</span> {network.portName}
      </div>
      <div className="text-sm text-muted-foreground mb-1">
        <span className="font-medium">Port:</span> {network.port}
      </div>
      <div className="text-sm text-muted-foreground mb-1">
        <span className="font-medium">Protocol:</span> {network.protocol}
      </div>
      <div className="text-sm text-muted-foreground mb-1">
        <span className="font-medium">Open Public Domain:</span> {network.openPublicDomain ? "Yes" : "No"}
      </div>
      <div className="text-sm text-muted-foreground mb-1">
        <span className="font-medium">Public Domain:</span> {network.publicDomain || "-"}
      </div>
      <div className="text-sm text-muted-foreground">
        <span className="font-medium">Custom Domain:</span> {network.customDomain || "-"}
      </div>
    </div>
    <Handle
      type="target"
      position={Position.Top}
      id="target-top"
      className="w-3 h-3 bg-green-500"
    />
    </>
  );
}
