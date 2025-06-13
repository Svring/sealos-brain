import { Handle, Position, useNodeId } from "@xyflow/react";
import { useState, useEffect } from "react";
import BaseNode from "./base-node";
import DevboxDetails from "./details/devbox-details";
import { DevboxSchema } from "@/provider/devbox/schemas/devbox-list-schema";
import { ServiceSchema } from "@/provider/devbox/schemas/devbox-check-ready-schema";
import { z } from "zod";

// Define the types from schemas
type DevboxType = z.infer<typeof DevboxSchema>;
type ServiceType = z.infer<typeof ServiceSchema>;

interface DevboxNodeData {
  // Core devbox data following DevboxSchema
  devbox?: DevboxType;
  // Service/ready data following ServiceDataSchema
  readyData?: ServiceType;
  // Template info (optional additional data)
  templateInfo?: {
    uid: string;
    templateRepository: {
      iconId: string;
    };
  };
}

export default function DevboxNode({ data }: { data: DevboxNodeData }) {
  const nodeId = useNodeId();
  // Extract devbox data
  const devbox = data.devbox;

  // Get the first ready service URL from passed data
  const serviceUrl = data.readyData?.url;

  return (
    <>
      <BaseNode id={nodeId} details={<DevboxDetails devbox={devbox} readyData={data.readyData} />}>
        <div className="space-y-1">
          <p className="text-sm font-medium truncate">
            {devbox ? devbox.metadata?.name : "Devbox"}
          </p>
          
          {devbox && (
            <>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">State:</span>
                <span className={`px-1.5 py-0.5 rounded text-xs ${
                  devbox.spec?.state === 'Running' ? 'bg-green-100 text-green-800' :
                  devbox.spec?.state === 'Stopped' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {devbox.spec?.state || devbox.status?.phase || 'Unknown'}
                </span>
              </div>
              
              {devbox.spec?.templateID && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Template:</span>
                  <span className="truncate">{devbox.spec.templateID}</span>
                </div>
              )}
              
              {!data.readyData && (
                <div className="text-xs text-muted-foreground">Loading URL...</div>
              )}
              
              {serviceUrl && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">URL:</span>
                  <a 
                    href={serviceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 truncate max-w-32"
                    title={serviceUrl}
                  >
                    {new URL(serviceUrl).hostname}
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </BaseNode>
      <Handle
        type="source"
        position={Position.Left}
        id="source-0"
        className="!bg-foreground !h-6 !rounded-lg"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source-1"
        className="!bg-foreground !h-6 !rounded-lg"
      />
    </>
  );
}
