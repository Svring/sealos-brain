import { Handle, Position } from '@xyflow/react';

interface BaseNodeProps {
  children: React.ReactNode;
  className?: string;
}

export default function BaseNode({ 
  children, 
  className = ""
}: BaseNodeProps) {
  return (
    <div className={`bg-background/50 rounded-lg p-1 w-80 h-40 border border-border ${className}`}>
      <div className="relative flex flex-col bg-background w-full h-full rounded-lg p-2">
        {children}
      </div>
    </div>
  );
}
