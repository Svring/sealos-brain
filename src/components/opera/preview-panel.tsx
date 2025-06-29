"use client";

import { useEffect, useState } from "react";
import { BrowserBar } from "./browser-bar";
import { Console } from "./console";
import { PreviewContent } from "./preview-content";

interface PreviewPanelProps {
  previewUrl: string;
}

export function PreviewPanel({ previewUrl }: PreviewPanelProps) {
  const [url, setUrl] = useState(previewUrl);
  const [refreshKey, setRefreshKey] = useState(0);

  // Update local url state when previewUrl prop changes
  useEffect(() => {
    setUrl(previewUrl);
  }, [previewUrl]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-background">
      {/* Browser Bar */}
      <BrowserBar onRefresh={handleRefresh} readOnly url={url} />

      {/* Preview Content */}
      <PreviewContent refreshKey={refreshKey} url={url} />

      {/* Console */}
      <Console />
    </div>
  );
}
