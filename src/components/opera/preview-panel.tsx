"use client";

import { BrowserBar } from "./browser-bar";
import { PreviewContent } from "./preview-content";
import { Console } from "./console";
import { useState, useEffect } from "react";

interface PreviewPanelProps {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  previewUrl: string;
}

export function PreviewPanel({
  isDarkMode,
  setIsDarkMode,
  previewUrl,
}: PreviewPanelProps) {
  const [url, setUrl] = useState(previewUrl);
  const [refreshKey, setRefreshKey] = useState(0);

  // Update local url state when previewUrl prop changes
  useEffect(() => {
    setUrl(previewUrl);
  }, [previewUrl]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="h-full flex flex-col bg-background border border-border rounded-lg">
      {/* Browser Bar */}
      <BrowserBar url={url} onUrlChange={() => {}} onRefresh={handleRefresh} readOnly />

      {/* Preview Content */}
      <PreviewContent
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        url={url}
        refreshKey={refreshKey}
      />

      {/* Console */}
      <Console />
    </div>
  );
}
