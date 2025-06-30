import { Handle, Position } from "@xyflow/react";
import { Globe } from "lucide-react";

export interface NetworkNodeData {
  portName: string;
  port: number;
  protocol: string;
  networkName: string;
  openPublicDomain: boolean;
  publicDomain: string;
  customDomain: string;
  devboxName?: string; // Optional reference to parent devbox
}

export default function NetworkNode({ data }: { data: NetworkNodeData }) {
  const network = data;
  return (
    <>
      <div className="relative w-48 rounded-lg border bg-background p-3 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-blue-600 text-sm">Network</span>
        </div>
        <div className="space-y-1">
          <div className="truncate text-xs">
            <span className="font-medium text-foreground">
              {network.publicDomain}
            </span>
          </div>
          <div className="text-muted-foreground text-xs">
            Port: {network.port}
          </div>
        </div>
      </div>
      <Handle
        className="h-2 w-2 bg-blue-500"
        id="target-top"
        position={Position.Top}
        type="target"
      />
    </>
  );
}
