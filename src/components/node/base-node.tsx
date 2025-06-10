import { useDetailsPanel } from "@/provider/details-provider";

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
  const { showDetails, hideDetails, activeDetailsId } = useDetailsPanel();

  const isMyDetailsShowing = activeDetailsId === id && id !== null;

  const handleClick = () => {
    if (isMyDetailsShowing) {
      hideDetails();
    } else if (details && id) {
      showDetails(id, details);
    }
  };

  return (
    <div
      className={`border-border bg-card rounded-lg p-2 w-60 min-h-30 border ${className} cursor-pointer`}
      onClick={handleClick}
    >
      {/* <div className="relative flex flex-col bg-[#1F2023] border-[#444444] w-full h-full rounded-lg p-2"> */}
        {children}
      {/* </div> */}
    </div>
  );
}
