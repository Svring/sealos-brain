"use client";

import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  RotateCcw,
  Share,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BrowserBarProps {
  url: string;
  onRefresh: () => void;
  readOnly?: boolean;
}

export function BrowserBar({ url, onRefresh }: BrowserBarProps) {
  const handleRefresh = () => {
    onRefresh();
  };

  return (
    <div className="relative flex items-center gap-2 rounded-t-lg border-border border-b bg-background px-4 py-2">
      <Button
        className="h-6 w-6 text-muted-foreground"
        size="icon"
        variant="ghost"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        className="h-6 w-6 text-muted-foreground"
        size="icon"
        variant="ghost"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        className="h-6 w-6 text-muted-foreground"
        onClick={handleRefresh}
        size="icon"
        variant="ghost"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <div className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2 flex w-1/2 justify-center">
        <div className="max-w-full overflow-x-auto rounded-md bg-background px-3 py-1">
          <span className="whitespace-nowrap text-muted-foreground text-sm">
            {url || "No preview URL available"}
          </span>
        </div>
      </div>
      <div className="flex-1" />
      <Button
        className="h-6 w-6 text-muted-foreground"
        size="icon"
        variant="ghost"
      >
        <Share className="h-4 w-4" />
      </Button>
      <Button
        className="h-6 w-6 text-muted-foreground"
        size="icon"
        variant="ghost"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
