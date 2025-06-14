import { useNodeView } from "@/components/node/node-view-provider";
import { Glass } from "@/components/ui/glass-effect";
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
    <Glass width="w-60" height="min-h-40" className="rounded-lg p-4">
      <div
        className={`border-border ${className} cursor-pointer w-full h-full`}
        onClick={handleShowDetails}
      >
        {children}
      </div>
    </Glass>
  );
}
