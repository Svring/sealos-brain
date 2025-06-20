import { usePanel } from "@/context/panel-provider";
import { Glass } from "@/components/ui/glass-effect";

interface BaseNodeProps {
  id: string | null;
  children: React.ReactNode;
  content?: React.ReactNode;
  className?: string;
}

export default function BaseNode({
  id,
  children,
  content,
  className = "",
}: BaseNodeProps) {
  if (!id) return null;
  const { openPanel } = usePanel();

  const handleShowDetails = () => {
    openPanel(id, content);
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
