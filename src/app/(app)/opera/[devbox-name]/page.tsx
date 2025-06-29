"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ChatPanel } from "@/components/opera/chat-panel";
// import { PreviewPanel } from "@/components/opera/preview-panel";
import { Loading } from "@/components/ui/loading";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  CopilotStateProvider,
  useCodeAgent,
} from "@/context/copilot-state-provider";
import { codeAgentConfig } from "@/lib/agent/code-agent";
import { devboxByNameOptions } from "@/lib/sealos/devbox/devbox-query";
import { transformDevboxAddresses } from "@/lib/sealos/devbox/devbox-transform";
import { useSealosStore } from "@/store/sealos-store";

function OperaPageContent({ devboxName }: { devboxName: string }) {
  const { currentUser, regionUrl } = useSealosStore();

  const devboxAddressesQuery = useQuery(
    devboxByNameOptions(
      currentUser,
      regionUrl,
      devboxName,
      transformDevboxAddresses
    )
  );

  useCodeAgent(devboxAddressesQuery.data?.devpod_address);

  if (devboxAddressesQuery.isLoading) {
    return <Loading fullPage text="Loading devbox addresses..." />;
  }

  return (
    <div className="flex h-screen w-screen flex-col p-2 text-foreground">
      <ResizablePanelGroup className="flex-1 gap-1" direction="horizontal">
        <ResizablePanel className="rounded-lg" defaultSize={25} minSize={25}>
          <ChatPanel devboxName={devboxName} />
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

export default function OperaPage({
  params,
}: {
  params: Promise<{ "devbox-name": string }>;
}) {
  const [devboxName, setDevboxName] = useState<string>("");

  useEffect(() => {
    params.then(({ "devbox-name": name }) =>
      setDevboxName(decodeURIComponent(name))
    );
  }, [params]);

  if (!devboxName) {
    return <Loading fullPage text="Initializing devbox..." />;
  }

  return (
    <CopilotStateProvider
      providerConfig={{
        runtimeUrl: codeAgentConfig.defaultConfig.runtimeUrl,
        agent: codeAgentConfig.defaultConfig.agent,
      }}
    >
      <OperaPageContent devboxName={devboxName} />
    </CopilotStateProvider>
  );
}
