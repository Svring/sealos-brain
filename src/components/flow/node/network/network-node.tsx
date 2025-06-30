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

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (network.publicDomain) {
      // Ensure the URL has a protocol
      const url = network.publicDomain.startsWith("http")
        ? network.publicDomain
        : `https://${network.publicDomain}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <>
      <div
        className="relative w-48 cursor-pointer rounded-lg border bg-background p-3 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        title={`Click to visit ${network.publicDomain}`}
      >
        <div className="mb-2 flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-blue-600 text-sm">Network</span>
        </div>
        <div className="space-y-1">
          <div className="truncate text-xs">
            <span className="font-medium text-foreground transition-colors hover:text-blue-600">
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
        id="source-bottom"
        position={Position.Bottom}
        type="target"
      />
    </>
  );
}
