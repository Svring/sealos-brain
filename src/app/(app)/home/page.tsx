"use client";

import { useCopilotChat } from "@copilotkit/react-core";
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql";
import { motion } from "framer-motion";
import { AI_Prompt } from "@/components/ai-chat/animated-ai-input";
import {
  ChatBubble,
  ChatBubbleMessage,
} from "@/components/ai-chat/chat-bubble";
import { ChatMessageList } from "@/components/ai-chat/chat-message-list";
import { Hero } from "@/components/ui/hero";
import { ScrollArea } from "@/components/ui/scroll-area";

import { CopilotStateProvider } from "@/context/copilot-state-provider";
import { activateDevboxActions } from "@/lib/agent/actions/devbox-action";
import { activateClusterActions } from "@/lib/agent/actions/cluster-action";
import { useEffect } from "react";

function Home() {
  const { visibleMessages, appendMessage, isLoading } = useCopilotChat();

  const sendMessage = (content: string) => {
    appendMessage(new TextMessage({ content, role: MessageRole.User }));
  };

  const hasMessages = visibleMessages.length > 0;

  activateDevboxActions();
  activateClusterActions();

  return (
    <motion.div className="flex h-full w-full flex-col items-center" layout>
      {/* Hero (only when there are no messages yet) */}
      {!hasMessages && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="h-[42vh] w-full"
          exit={{ opacity: 0, y: -20 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
        >
          <Hero
            actionsClassName="mt-4"
            className="min-h-full"
            subtitle="We have lingered in the chambers of the sea. By sea-girls wreathed with seaweed red and brown"
            subtitleClassName="text-lg md:text-xl max-w-[600px]"
            title="Sealos Brain"
            titleClassName="text-5xl md:text-6xl font-extrabold"
          />
        </motion.div>
      )}

      {/* Message list – appears when user starts chatting */}
      {hasMessages && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex-1 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          key="messages"
          transition={{ duration: 0.5 }}
        >
          <ScrollArea className="h-full">
            <ChatMessageList className="mx-auto max-w-3xl rounded-xl">
              {visibleMessages
                .filter((message) => message.isTextMessage?.())
                .map((message) => {
                  const textMsg = message as TextMessage;
                  const variant =
                    textMsg.role === MessageRole.User ? "sent" : "received";

                  return textMsg.content ? (
                    <ChatBubble key={message.id} variant={variant}>
                      <ChatBubbleMessage variant={variant}>
                        {textMsg.content}
                      </ChatBubbleMessage>
                    </ChatBubble>
                  ) : null;
                })}

              {isLoading && (
                <ChatBubble variant="received">
                  <ChatBubbleMessage isLoading />
                </ChatBubble>
              )}
            </ChatMessageList>
          </ScrollArea>
        </motion.div>
      )}

      {/* AI Prompt – always at the bottom */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-3xl"
        initial={{ opacity: 0, y: 50 }}
        layout
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <AI_Prompt className="max-w-3xl" onSend={sendMessage} />
      </motion.div>
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <CopilotStateProvider
      initialConfig={{
        runtimeUrl: "/api/agent/sealos-brain",
        agent: "sealos_brain",
      }}
    >
      <Home />
    </CopilotStateProvider>
  );
}
