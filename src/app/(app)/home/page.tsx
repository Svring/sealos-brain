"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { CopilotStateProvider } from "@/context/copilot-state-provider";

export function HomePage() {
  return (
    <div className="flex h-full w-full flex-col items-center">
      <CopilotChat
        className="h-full w-4xl"
        instructions={
          "You are assisting the user as best as you can. Answer in the best way possible given the data you have."
        }
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
      initialConfig={{
        runtimeUrl: "/api/agent/sealos-brain",
        agent: "sealos_brain",
      }}
    >
      <HomePage />
    </CopilotStateProvider>
  );
}
