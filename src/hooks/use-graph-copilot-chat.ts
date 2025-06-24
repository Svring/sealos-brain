import { useState, useEffect } from "react";
import { useCopilotChat } from "@copilotkit/react-core";
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql";

export function useGraphCopilotChat() {
  const copilot = useCopilotChat();
  const [isMessageSwiperExpanded, setIsMessageSwiperExpanded] = useState(false);

  useEffect(() => {
    if (copilot.visibleMessages.length > 1) setIsMessageSwiperExpanded(true);
  }, [copilot.visibleMessages.length]);

  return {
    ...copilot,
    isMessageSwiperExpanded,
    setIsMessageSwiperExpanded,
  };
}

export { MessageRole, TextMessage };
