"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { Loading } from "@/components/ui/loading";
import {
  CopilotStateProvider,
  useSealosBrainAgent,
} from "@/context/copilot-state-provider";
import { sealosBrainConfig } from "@/lib/agent/sealos-brain";
import { useSealosStore } from "@/store/sealos-store";

function HomePageContent() {
  useSealosBrainAgent();

  return (
    <div className="flex h-full w-full flex-col items-center">
      <CopilotChat
        className="h-full w-4xl"
        labels={{
          initial: "Hi! what app do you want to build today?",
        }}
      />
    </div>
  );
}

function Hydrated({ children }: { children: React.ReactNode }) {
  const user = useSealosStore((s) => s.currentUser);
  if (!user) {
    return <Loading />;
  }
  return <>{children}</>;
}

export default function Home() {
  return (
    <Hydrated>
      <CopilotStateProvider
        providerConfig={{
          runtimeUrl: sealosBrainConfig.providerConfig.runtimeUrl,
          agent: sealosBrainConfig.providerConfig.agent,
        }}
      >
        <HomePageContent />
      </CopilotStateProvider>
    </Hydrated>
  );
}
