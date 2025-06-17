"use client";

import { useState } from "react";
import { Settings, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function Console() {
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);

  return (
    <div className="border-t border-zinc-800">
      <button
        onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-zinc-900/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="text-sm">Console</span>
        </div>
        <ChevronUp
          className={cn(
            "h-4 w-4 transition-transform",
            isConsoleExpanded && "rotate-180"
          )}
        />
      </button>

      {isConsoleExpanded && (
        <div className="h-32 bg-zinc-900 border-t border-zinc-800 p-4">
          <div className="text-xs text-zinc-500 font-mono">
            Console output will appear here...
          </div>
        </div>
      )}
    </div>
  );
} 