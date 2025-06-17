"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Share,
  Maximize2,
} from "lucide-react";
import { useState } from "react";

interface BrowserBarProps {
  url: string;
  onUrlChange: (url: string) => void;
  onRefresh: () => void;
}

export function BrowserBar({ url, onUrlChange, onRefresh }: BrowserBarProps) {
  const [inputUrl, setInputUrl] = useState(url);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = inputUrl.trim();
    
    // Add https:// if no protocol is specified
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    
    onUrlChange(finalUrl);
  };

  const handleRefresh = () => {
    onRefresh();
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-background border-b border-border">
      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 text-muted-foreground"
        onClick={handleRefresh}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <form onSubmit={handleSubmit} className="flex-1">
        <Input
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Enter website URL..."
          className="bg-background text-sm"
          onBlur={handleSubmit}
        />
      </form>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
        <Share className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
