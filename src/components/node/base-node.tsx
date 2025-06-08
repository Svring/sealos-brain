import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface BaseNodeProps {
  children: React.ReactNode;
  details?: React.ReactNode;
  className?: string;
}

export default function BaseNode({
  children,
  details,
  className = "",
}: BaseNodeProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className={`bg-background/50 rounded-lg p-1 w-80 h-40 border border-border ${className} cursor-pointer`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative flex flex-col bg-background w-full h-full rounded-lg p-2">
          {children}
        </div>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen} modal={false}>
        {details && (
          <SheetContent
            nonModal
            onInteractOutside={(event) => {
              event.preventDefault();
            }}
            className="p-4"
          >
            {details}
          </SheetContent>
        )}
      </Sheet>
    </>
  );
}
