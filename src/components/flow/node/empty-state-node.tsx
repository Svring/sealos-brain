import { memo } from "react";
import { NodeProps } from "@xyflow/react";

interface EmptyStateNodeData {
  graphName: string;
}

function EmptyStateNode({ data }: NodeProps) {
  const isOverview = data.graphName === "overview";
  
  return (
    <div className="bg-background/95 backdrop-blur-sm rounded-xl p-8 border-2 border-dashed border-muted-foreground/30 shadow-lg pointer-events-none min-w-[420px] max-w-[500px]">
      <div className="text-center">
        <div className="mb-4 text-4xl">
          {isOverview ? "📊" : "🎨"}
        </div>
        <h2 className="text-2xl font-semibold mb-3">
          {isOverview ? "No Graphs Yet" : "Welcome to Your New Graph!"}
        </h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {isOverview 
            ? "You haven't created any graphs yet. Start by adding resources with graphName annotations to see them visualized here."
            : "This is an empty graph waiting for your creativity. Click the \"Add Node\" button above to start building your infrastructure visualization."
          }
        </p>
        <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
          💡 Tip: {isOverview 
            ? "Add annotations like 'graphName: my-project' to your Kubernetes resources"
            : "You can drag nodes around and connect them to create relationships"
          }
        </div>
      </div>
    </div>
  );
}

export default memo(EmptyStateNode); 