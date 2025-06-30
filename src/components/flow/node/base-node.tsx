import { Handle, Position } from "@xyflow/react";
import { type MouseEvent, memo } from "react";
import { usePanel } from "@/context/panel-provider";

interface BaseNodeProps {
  id?: string;
  children: React.ReactNode;
  content?: React.ReactNode;
  className?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  isSelected?: boolean;
}

const BaseNode = ({
  id,
  children,
  content,
  className = "",
  onClick,
  isSelected,
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
      <div className="flex h-40 w-60 flex-col rounded-lg border border-border bg-background p-4">
        <button
          className={`h-full w-full cursor-pointer overflow-hidden border-border ${className}`}
          onClick={handleClick}
          type="button"
        >
          <div className="h-full w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {children}
          </div>
        </button>
      </div>
      <Handle position={Position.Top} type="source" />
      <Handle position={Position.Bottom} type="target" />
    </>
  );
};

export default memo(BaseNode);
