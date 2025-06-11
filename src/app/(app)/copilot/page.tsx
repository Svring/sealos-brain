"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { useSealosStore } from "@/store/sealos-store";
import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";

type AgentState = {
  topic: string;
};

export default function CopilotPage() {
  const { currentUser } = useSealosStore();

  const { state, setState } = useCoAgent<AgentState>({
    name: "copilot",
    initialState: { topic: "food" },
  });

  useCoAgentStateRender({
    name: "copilot",
    render: ({ state }) => {
      if (!state.topic) return null;
      return (
        <div className="bg-muted p-4 rounded-md">Topic: {state.topic}</div>
      );
    },
  });

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center relative">
      <CopilotChat
        className="h-full w-3/5"
        instructions={
          "You are assisting the user as best as you can. Answer in the best way possible given the data you have."
        }
        labels={{
          title: "Sealos Copilot",
          initial: `Hi! 👋 How can I assist you today, ${currentUser?.username}?`,
        }}
      />
    </div>
  );
}
