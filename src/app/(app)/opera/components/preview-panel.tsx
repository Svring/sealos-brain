"use client";

import { BrowserBar } from "./browser-bar";
import { PreviewContent } from "./preview-content";
import { Console } from "./console";
import { useState } from "react";

interface PreviewPanelProps {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

export function PreviewPanel({
  isDarkMode,
  setIsDarkMode,
}: PreviewPanelProps) {
  const [url, setUrl] = useState("https://mpiadxtjesgr.sealosbja.site");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="h-full flex flex-col bg-background border border-border rounded-lg">
      {/* Browser Bar */}
      <BrowserBar url={url} onUrlChange={setUrl} onRefresh={handleRefresh} />

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
