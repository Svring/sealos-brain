"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";

interface GeneratedFile {
  name: string;
  status: string;
}

interface VersionSectionProps {
  generatedFiles: GeneratedFile[];
}

export function VersionSection({ generatedFiles }: VersionSectionProps) {
  const [isVersionExpanded, setIsVersionExpanded] = useState(true);

  return (
    <div className="border border-zinc-800 rounded-lg">
      <button
        onClick={() => setIsVersionExpanded(!isVersionExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-zinc-900/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isVersionExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="font-medium">Version 1</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-zinc-800 text-zinc-300"
          >
            Latest
          </Badge>
          <Badge
            variant="outline"
            className="border-zinc-700 text-zinc-400"
          >
            Viewing
          </Badge>
        </div>
      </button>

      {isVersionExpanded && (
        <div className="border-t border-zinc-800">
          {generatedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 hover:bg-zinc-900/50 transition-colors border-b border-zinc-800 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm font-mono">
                  {file.name}
                </span>
              </div>
              <Badge
                variant="outline"
                className="border-zinc-700 text-zinc-400 text-xs"
              >
                {file.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 