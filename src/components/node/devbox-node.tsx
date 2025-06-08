import { Handle, Position } from "@xyflow/react";
import BaseNode from "./base-node";
import DevboxDetails from "./details/devbox-details";

export default function DevboxNode({ data }: { data: any }) {
  return (
    <>
      <BaseNode details={<DevboxDetails />}>
        <p className="text-sm font-medium">Devbox</p>
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
