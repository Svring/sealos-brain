"use client";

import { ChatPanel } from "@/components/opera/chat-panel";
import { PreviewPanel } from "@/components/opera/preview-panel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { CopilotStateProvider } from "@/context/copilot-state-provider";
import { DevboxSelectionProvider } from "@/context/devbox-selection-provider";
import { codeAgentConfig } from "@/lib/agent/code-agent";

function OperaPageContent() {
  return (
    <DevboxSelectionProvider>
      <div className="flex h-screen w-full flex-col p-2 text-foreground">
        <ResizablePanelGroup className="flex-1 gap-1" direction="horizontal">
          <ResizablePanel className="rounded-lg" defaultSize={25} minSize={25}>
            <ChatPanel />
          </ResizablePanel>
          <ResizableHandle className="bg-transparent" />
          <ResizablePanel className="rounded-lg" defaultSize={75}>
            <PreviewPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </DevboxSelectionProvider>
  );
}

export default function OperaPage() {
  return (
    <CopilotStateProvider
      providerConfig={{
        runtimeUrl: codeAgentConfig.defaultConfig.runtimeUrl,
        agent: codeAgentConfig.defaultConfig.agent,
      }}
    >
      <OperaPageContent />
    </CopilotStateProvider>
  );
}
