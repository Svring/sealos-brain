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
      <div className="relative w-64 rounded-lg border bg-background p-4 shadow-md">
        <div className="mb-2 truncate font-bold text-lg">
          Network: {network.networkName}
        </div>
        <div className="mb-1 text-muted-foreground text-sm">
          <span className="font-medium">Port Name:</span> {network.portName}
        </div>
        <div className="mb-1 text-muted-foreground text-sm">
          <span className="font-medium">Port:</span> {network.port}
        </div>
        <div className="mb-1 text-muted-foreground text-sm">
          <span className="font-medium">Protocol:</span> {network.protocol}
        </div>
        <div className="mb-1 text-muted-foreground text-sm">
          <span className="font-medium">Open Public Domain:</span>{" "}
          {network.openPublicDomain ? "Yes" : "No"}
        </div>
        <div className="mb-1 text-muted-foreground text-sm">
          <span className="font-medium">Public Domain:</span>{" "}
          {network.publicDomain || "-"}
        </div>
        <div className="text-muted-foreground text-sm">
          <span className="font-medium">Custom Domain:</span>{" "}
          {network.customDomain || "-"}
        </div>
      </div>
      <Handle
        className="h-3 w-3 bg-green-500"
        id="target-top"
        position={Position.Top}
        type="target"
      />
    </>
  );
}
