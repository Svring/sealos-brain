"use client";

import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  RotateCcw,
  Share,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BrowserBarProps {
  url: string;
  onRefresh: () => void;
  readOnly?: boolean;
}

export function BrowserBar({
  url,
  onRefresh,
  readOnly = false,
}: BrowserBarProps) {
  const [inputUrl, setInputUrl] = useState(url);

  // Update local state when prop changes
  useEffect(() => {
    setInputUrl(url);
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) {
      return; // Prevent changes when read-only
    }
    let finalUrl = inputUrl.trim();

    // Add https:// if no protocol is specified
    if (
      finalUrl &&
      !finalUrl.startsWith("http://") &&
      !finalUrl.startsWith("https://")
    ) {
      finalUrl = `https://${finalUrl}`;
    }

    // onUrlChange(finalUrl);
  };

  const handleRefresh = () => {
    onRefresh();
  };

  return (
    <div className="flex items-center gap-2 rounded-t-lg border-border border-b bg-background px-4 py-2">
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
      <form className="flex-1" onSubmit={handleSubmit}>
        <Input
          className="bg-background text-sm"
          onBlur={handleSubmit}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Enter website URL..."
          readOnly={readOnly}
          value={inputUrl}
        />
      </form>
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
