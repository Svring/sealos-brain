"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrowserBar } from "./browser-bar";
import { PreviewContent } from "./preview-content";
import { Console } from "./console";

interface PreviewPanelProps {
  previewTab: string;
  setPreviewTab: (tab: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

export function PreviewPanel({
  previewTab,
  setPreviewTab,
  isDarkMode,
  setIsDarkMode,
}: PreviewPanelProps) {
  return (
    <div className="h-full flex flex-col bg-background border border-border rounded-lg">
      {/* Preview/Code Tabs */}
      <div className="flex items-center justify-between border-b border-border">
        <Tabs value={previewTab} onValueChange={setPreviewTab}>
          <TabsList className="bg-transparent border-0 rounded-none h-auto p-1">
            <TabsTrigger
              value="preview"
            >
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="code"
            >
              Code
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Browser Bar */}
      <BrowserBar />

      {/* Preview Content */}
      <PreviewContent
        previewTab={previewTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Console */}
      <Console />
    </div>
  );
}
