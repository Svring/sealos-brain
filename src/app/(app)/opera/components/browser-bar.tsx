"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Share,
  Maximize2,
} from "lucide-react";

export function BrowserBar() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-background border-b border-border">
      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
        <RotateCcw className="h-4 w-4" />
      </Button>
      <div className="flex-1 bg-background rounded px-3 py-1 text-sm text-muted-foreground">
        /
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
        <Share className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
