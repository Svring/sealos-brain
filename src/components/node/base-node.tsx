import { useNodeView } from "@/components/node/node-view-provider";
import { cn } from "@/lib/utils";
import { type Node } from "@xyflow/react";

interface BaseNodeProps {
  id: string | null;
  children: React.ReactNode;
  details?: React.ReactNode;
  className?: string;
}

export default function BaseNode({
  id,
  children,
  details,
  className = "",
}: BaseNodeProps) {
  if (!id) return null;
  const { showDetails } = useNodeView();

  const handleShowDetails = () => {
    showDetails(id, details);
  };

  return (
    <div
      className={`border-border bg-card rounded-lg p-2 w-60 min-h-30 border ${className} cursor-pointer`}
      onClick={handleShowDetails}
    >
      {/* <div className="relative flex flex-col bg-[#1F2023] border-[#444444] w-full h-full rounded-lg p-2"> */}
        {children}
      {/* </div> */}
    </div>
  );
}
