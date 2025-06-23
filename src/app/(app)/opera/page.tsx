"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ChatPanel } from "./components/chat-panel";
import { PreviewPanel } from "./components/preview-panel";
import { CopilotStateProvider } from "@/context/copilot-state-provider";
import { useSealosStore } from "@/store/sealos-store";
import { useQuery, useQueries } from "@tanstack/react-query";
import {
  devboxListOptions,
  devboxByNameOptions,
} from "@/lib/sealos/devbox/devbox-query";
import {
  transformDevboxListToNames,
  transformDevboxAddresses,
} from "@/lib/sealos/devbox/devbox-transform";

interface DevboxOption {
  name: string;
  preview_address: string;
  galatea_address: string;
}

export default function OperaPage() {
  const [activeTab, setActiveTab] = useState("chat");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedDevboxName, setSelectedDevboxName] = useState<string>(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("selectedDevboxName") || ""
      : ""
  );

  const { currentUser, regionUrl } = useSealosStore();

  // Fetch devbox names
  const { data: devboxNames = [] } = useQuery(
    devboxListOptions(currentUser, regionUrl, transformDevboxListToNames)
  );

  // Fetch devbox addresses
  const devboxAddressQueries = useQueries({
    queries: devboxNames.map((name: string) =>
      devboxByNameOptions(currentUser, regionUrl, name, (data) => ({
        name,
        ...transformDevboxAddresses(data),
      }))
    ),
  });

  // Filter valid devbox options
  const devboxOptions: DevboxOption[] = useMemo(
    () =>
      devboxAddressQueries
        .map((q) => q.data)
        .filter((opt): opt is DevboxOption => !!opt && typeof opt === 'object' && !("error" in opt)),
    [devboxAddressQueries]
  );

  // Auto-select first devbox
  useEffect(() => {
    if (!selectedDevboxName && devboxOptions.length > 0) {
      const firstDevbox = devboxOptions[0].name;
      setSelectedDevboxName(firstDevbox);
      localStorage.setItem("selectedDevboxName", firstDevbox);
    }
  }, [devboxOptions, selectedDevboxName]);

  // Handle devbox selection
  const handleSelectDevbox = (name: string) => {
    setSelectedDevboxName(name);
    localStorage.setItem("selectedDevboxName", name);
  };

  const selectedDevbox = devboxOptions.find(
    (opt) => opt.name === selectedDevboxName
  );
  const previewUrl = selectedDevbox?.preview_address || "";

  return (
    <CopilotStateProvider
      initialConfig={{
        runtimeUrl: "/api/agent/code",
        agent: "code",
        project_address: "",
        token: "",
      }}
    >
      <div className="h-screen w-screen flex flex-col p-2 text-foreground">
        <ResizablePanelGroup direction="horizontal" className="flex-1 gap-1">
          <ResizablePanel defaultSize={25} minSize={25} className="rounded-lg">
            <ChatPanel
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              devboxOptions={devboxOptions}
              selectedDevboxName={
                selectedDevboxName || devboxOptions[0]?.name || ""
              }
              onSelectDevbox={handleSelectDevbox}
            />
          </ResizablePanel>
          <ResizableHandle className="bg-transparent" />
          <ResizablePanel defaultSize={75} className="rounded-lg">
            <PreviewPanel
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              previewUrl={previewUrl}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </CopilotStateProvider>
  );
}
