"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import {
  CopilotStateProvider,
  useSealosBrainAgent,
} from "@/context/copilot-state-provider";
import { sealosBrainConfig } from "@/lib/agent/sealos-brain";

function HomePageContent() {
  useSealosBrainAgent();

  return (
    <div className="flex h-full w-full flex-col items-center">
      <CopilotChat
        className="h-full w-4xl"
        labels={{
          initial: "Hi! 👋 How can I assist you today?",
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <CopilotStateProvider
      providerConfig={{
        runtimeUrl: sealosBrainConfig.providerConfig.runtimeUrl,
        agent: sealosBrainConfig.providerConfig.agent,
      }}
    >
      <HomePageContent />
    </CopilotStateProvider>
  );
}
