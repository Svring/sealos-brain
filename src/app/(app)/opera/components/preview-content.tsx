"use client";

import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

interface PreviewContentProps {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  url: string;
  refreshKey: number;
}

export function PreviewContent({ isDarkMode, setIsDarkMode, url, refreshKey }: PreviewContentProps) {

  return (
    <div className="flex-1 relative">
      <div className="h-full bg-zinc-950 relative">
        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 z-10 border-zinc-700 hover:bg-zinc-800"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Website Preview */}
        {url ? (
          <iframe
            key={refreshKey}
            src={url}
            className="w-full h-full border-0"
            title="Website Preview"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-400">
            Enter a URL in the address bar to preview a website
          </div>
        )}
      </div>
    </div>
  );
} 