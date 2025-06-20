"use client";

import { AI_Prompt } from "@/components/ai-chat/home/animated-ai-input";
import { Hero } from "@/components/ui/hero";
import { motion } from "framer-motion";

import { ChatMessageList } from "@/components/ai-chat/chat-message-list";
import { ChatBubble, ChatBubbleMessage } from "@/components/ai-chat/chat-bubble";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useCopilotChat } from "@copilotkit/react-core";
import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";

import { CopilotStateProvider } from "@/context/copilot-state-provider";

function Home() {
  const { visibleMessages, appendMessage, isLoading } = useCopilotChat();

  const sendMessage = (content: string) => {
    appendMessage(new TextMessage({ content, role: MessageRole.User }));
  };

  const hasMessages = visibleMessages.length > 0;

  return (
    <motion.div layout className="flex flex-col h-full w-full items-center">
      {/* Hero (only when there are no messages yet) */}
      {!hasMessages && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="h-[42vh] w-full"
        >
          <Hero
            title="Sealos Brain"
            subtitle="We have lingered in the chambers of the sea. By sea-girls wreathed with seaweed red and brown"
            titleClassName="text-5xl md:text-6xl font-extrabold"
            subtitleClassName="text-lg md:text-xl max-w-[600px]"
            actionsClassName="mt-4"
            className="min-h-full"
          />
        </motion.div>
      )}

      {/* Message list – appears when user starts chatting */}
      {hasMessages && (
        <motion.div
          key="messages"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 w-full overflow-hidden"
        >
          <ScrollArea className="h-full">
            <ChatMessageList className="rounded-xl max-w-3xl mx-auto">
              {visibleMessages.map((message) => {
                if (!message.isTextMessage || !message.isTextMessage()) {
                  return null;
                }

                const textMsg = message as TextMessage;
                const variant =
                  textMsg.role === MessageRole.User ? "sent" : "received";

                return (
                  <ChatBubble key={message.id} variant={variant}>
                    <ChatBubbleMessage variant={variant}>
                      {textMsg.content}
                    </ChatBubbleMessage>
                  </ChatBubble>
                );
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
        layout
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-3xl mx-auto"
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
        runtimeUrl: "/api/copilot",
        agent: "copilot",
      }}
    >
      <Home />
    </CopilotStateProvider>
  );
}
