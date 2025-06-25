import { Handle, Position } from "@xyflow/react";
import { type MouseEvent, memo } from "react";
import { Glass } from "@/components/ui/glass-effect";
import { usePanel } from "@/context/panel-provider";

interface BaseNodeProps {
  id?: string;
  children: React.ReactNode;
  content?: React.ReactNode;
  className?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

const BaseNode = ({
  id,
  children,
  content,
  className = "",
  onClick,
}: BaseNodeProps) => {
  const { openPanel } = usePanel();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented && id) {
      openPanel(id, content);
    }
  };

  return (
    <>
      <Glass className="rounded-lg p-4" height="min-h-40" width="w-60">
        <button
          className={`h-full w-full cursor-pointer border-border ${className}`}
          onClick={handleClick}
          type="button"
        >
          {children}
        </button>
      </Glass>
      <Handle position={Position.Top} type="source" />
      <Handle position={Position.Bottom} type="target" />
    </>
  );
};

export default memo(BaseNode);
