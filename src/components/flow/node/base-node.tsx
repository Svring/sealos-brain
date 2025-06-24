import { Glass } from "@/components/ui/glass-effect";
import { usePanel } from "@/context/panel-provider";

interface BaseNodeProps {
  id: string | null;
  children: React.ReactNode;
  content?: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  isSelected?: boolean;
}

export default function BaseNode({
  id,
  children,
  content,
  className = "",
  onClick,
  isSelected = false,
}: BaseNodeProps) {
  if (!id) return null;
  const { openPanel } = usePanel();

  const handleShowDetails = (event: React.MouseEvent) => {
    if (onClick) {
      onClick(event);
      return;
    }
    openPanel(id, content);
  };

  return (
    <Glass className="rounded-lg p-4" height="min-h-40" width="w-60">
      <div
        className={`border-border ${className} h-full w-full cursor-pointer`}
        onClick={handleShowDetails}
      >
        {children}
      </div>
    </Glass>
  );
}
