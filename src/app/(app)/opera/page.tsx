"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ChatPanel } from "@/components/opera/chat-panel";
import { PreviewPanel } from "@/components/opera/preview-panel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { CopilotStateProvider } from "@/context/copilot-state-provider";
import {
  devboxByNameOptions,
  devboxListOptions,
} from "@/lib/sealos/devbox/devbox-query";
import {
  transformDevboxAddresses,
  transformDevboxListToNames,
} from "@/lib/sealos/devbox/devbox-transform";
import { useSealosStore } from "@/store/sealos-store";

interface DevboxOption {
  name: string;
  preview_address: string;
  galatea_address: string;
}

export const dynamic = "force-dynamic";

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
        .filter(
          (opt): opt is DevboxOption =>
            !!opt && typeof opt === "object" && !("error" in opt)
        ),
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
      <div className="flex h-screen w-screen flex-col p-2 text-foreground">
        <ResizablePanelGroup className="flex-1 gap-1" direction="horizontal">
          <ResizablePanel className="rounded-lg" defaultSize={25} minSize={25}>
            <ChatPanel
              activeTab={activeTab}
              devboxOptions={devboxOptions}
              onSelectDevbox={handleSelectDevbox}
              selectedDevboxName={
                selectedDevboxName || devboxOptions[0]?.name || ""
              }
              setActiveTab={setActiveTab}
            />
          </ResizablePanel>
          <ResizableHandle className="bg-transparent" />
          <ResizablePanel className="rounded-lg" defaultSize={75}>
            <PreviewPanel
              isDarkMode={isDarkMode}
              previewUrl={previewUrl}
              setIsDarkMode={setIsDarkMode}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </CopilotStateProvider>
  );
}
