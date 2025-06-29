"use client";

import { ChatPanel } from "@/components/opera/chat-panel";
// import { PreviewPanel } from "@/components/opera/preview-panel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { CopilotStateProvider } from "@/context/copilot-state-provider";
import { codeAgentConfig } from "@/lib/agent/code-agent";

function OperaPageContent() {
  return (
    <div className="flex h-screen w-screen flex-col p-2 text-foreground">
      <ResizablePanelGroup className="flex-1 gap-1" direction="horizontal">
        <ResizablePanel className="rounded-lg" defaultSize={25} minSize={25}>
          <ChatPanel />
        </ResizablePanel>
        <ResizableHandle className="bg-transparent" />
        <ResizablePanel className="rounded-lg" defaultSize={75}>
          <div className="h-full rounded-lg bg-muted p-4">
            <h3 className="font-medium text-md">
              Preview Panel (Commented Out)
            </h3>
            <p className="mt-2 text-muted-foreground text-sm">
              PreviewPanel component is commented out to avoid errors during
              refactoring.
            </p>
            {/* <PreviewPanel previewUrl={previewUrl} /> */}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
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
