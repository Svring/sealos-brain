"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { useSealosStore } from "@/store/sealos-store";
import { activateDevboxActions } from "@/lib/devbox/devbox-action";

export default function CopilotPage() {
  const sealosStore = useSealosStore();
  const { currentUser } = sealosStore;

  activateDevboxActions();

  return (
    <div className="h-screen w-screen flex flex-col relative">
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
