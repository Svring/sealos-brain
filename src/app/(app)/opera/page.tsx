"use client";

import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ChatPanel } from "./components/chat-panel";
import { PreviewPanel } from "./components/preview-panel";

const generatedFiles = [
  { name: "app/layout.tsx", status: "Generated" },
  { name: "components/theme-switcher.tsx", status: "Generated" },
  { name: "app/globals.css", status: "Generated" },
  { name: "app/page.tsx", status: "Generated" },
  { name: "components/theme-toggle.tsx", status: "Generated" },
];

export default function OperaPage() {
  const [activeTab, setActiveTab] = useState("chat");
  const [previewTab, setPreviewTab] = useState("preview");
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className="h-screen w-screen text-foreground flex flex-col p-2">
      <ResizablePanelGroup direction="horizontal" className="flex-1 gap-1">
        {/* Left Panel - Chat */}
        <ResizablePanel defaultSize={25} minSize={25} className="rounded-lg">
          <ChatPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            generatedFiles={generatedFiles}
          />
        </ResizablePanel>

        <ResizableHandle className="bg-transparent" />

        {/* Right Panel - Preview */}
        <ResizablePanel defaultSize={75} className="rounded-lg">
          <PreviewPanel
            previewTab={previewTab}
            setPreviewTab={setPreviewTab}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
