"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ChatPanel } from "./components/chat-panel";
import { PreviewPanel } from "./components/preview-panel";
import {
  CopilotStateProvider,
  useCopilotConfig,
} from "@/context/copilot-state-provider";
import { useSealosStore } from "@/store/sealos-store";
import { useQuery, useQueries } from "@tanstack/react-query";
import {
  devboxListOptions,
  devboxByNameOptions,
} from "@/lib/devbox/devbox-query";
import {
  transformDevboxListToNames,
  transformDevboxAddresses,
} from "@/lib/devbox/devbox-transform";

interface DevboxOption {
  name: string;
  preview_address: string;
  galatea_address: string;
}

function OperaPageContent() {
  const [activeTab, setActiveTab] = useState("chat");
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sealos store for auth/region context
  const { currentUser, regionUrl } = useSealosStore();

  // Fetch devbox names list
  const { data: devboxNames = [] } = useQuery(
    devboxListOptions(currentUser, regionUrl, transformDevboxListToNames)
  );

  // Fetch addresses for each devbox name
  const devboxAddressQueries = useQueries({
    queries: devboxNames.map((name: string) =>
      devboxByNameOptions(currentUser, regionUrl, name, (data: any) => {
        const addresses = transformDevboxAddresses(data);
        return { name, ...addresses };
      })
    ),
  });

  // Combine results into devbox options with both addresses present
  const devboxOptions: DevboxOption[] = useMemo(() => {
    return devboxAddressQueries
      .map((q) => q.data as DevboxOption | (DevboxOption & { error?: string }) | undefined)
      .filter((opt): opt is DevboxOption => {
        if (!opt) return false;
        return !(opt as any).error;
      });
  }, [devboxAddressQueries]);

  // Selected devbox name state with localStorage persistence
  const [selectedDevboxName, setSelectedDevboxName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedDevboxName') || '';
    }
    return '';
  });

  // Auto-select first devbox when available and no selection exists
  useEffect(() => {
    if (!selectedDevboxName && devboxOptions.length > 0) {
      const firstDevbox = devboxOptions[0].name;
      setSelectedDevboxName(firstDevbox);
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedDevboxName', firstDevbox);
      }
    }
  }, [devboxOptions, selectedDevboxName]);

  // Persist selection to localStorage
  const handleSelectDevbox = (name: string) => {
    setSelectedDevboxName(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedDevboxName', name);
    }
  };

  const selectedDevbox = devboxOptions.find(
    (opt) => opt.name === selectedDevboxName
  );

  const previewUrl = selectedDevbox?.preview_address || "";

  return (
    <div className="h-screen w-screen text-foreground flex flex-col p-2">
      <ResizablePanelGroup direction="horizontal" className="flex-1 gap-1">
        {/* Left Panel - Chat */}
        <ResizablePanel defaultSize={25} minSize={25} className="rounded-lg">
          <ChatPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            devboxOptions={devboxOptions}
            selectedDevboxName={selectedDevboxName || (devboxOptions[0]?.name || '')}
            onSelectDevbox={handleSelectDevbox}
          />
        </ResizablePanel>

        <ResizableHandle className="bg-transparent" />

        {/* Right Panel - Preview */}
        <ResizablePanel defaultSize={75} className="rounded-lg">
          <PreviewPanel
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            previewUrl={previewUrl}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function OperaPageWithConfig() {
  return <OperaPageContent />;
}

export default function OperaPage() {
  return (
    <CopilotStateProvider
      initialConfig={{
        runtimeUrl: "/api/code",
        agent: "code",
        project_address: "",
        token: "",
      }}
    >
      <OperaPageWithConfig />
    </CopilotStateProvider>
  );
}
