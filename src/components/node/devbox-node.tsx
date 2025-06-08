import { Handle, Position } from '@xyflow/react';
import BaseNode from './base-node';

export default function DevboxNode({ data }: { data: any }) {
  return (
    <>
      <BaseNode>
        <p className="text-sm font-medium">Devbox</p>
      </BaseNode>
      <Handle type="source" position={Position.Bottom} id="source-0" />
    </>
  );
}