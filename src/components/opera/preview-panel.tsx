"use client";

import { useState } from "react";
import { useDevboxSelection } from "@/context/devbox-selection-provider";
import { BrowserBar } from "./browser-bar";
import { Console } from "./console";
import { PreviewContent } from "./preview-content";

export function PreviewPanel() {
  const { previewUrl } = useDevboxSelection();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-background">
      {/* Browser Bar */}
      <BrowserBar onRefresh={handleRefresh} readOnly url={previewUrl} />

      {/* Preview Content */}
      <PreviewContent refreshKey={refreshKey} url={previewUrl} />

      {/* Console */}
      <Console />
    </div>
  );
}
