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
      <div className="h-full bg-background relative">
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
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Enter a URL in the address bar to preview a website
          </div>
        )}
      </div>
    </div>
  );
} 