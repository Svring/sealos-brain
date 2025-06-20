"use client";

import { AI_Prompt } from "@/components/ai/home/animated-ai-input";
import { Hero } from "@/components/blocks/hero";
import { motion } from "framer-motion";

import { ChatMessageList } from "@/components/ai/chat-message-list";
import { ChatBubble, ChatBubbleMessage } from "@/components/ai/chat-bubble";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useCopilotChat } from "@copilotkit/react-core";
import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";

import { CopilotStateProvider } from "@/context/copilot-state-provider";

function Home() {
  const { visibleMessages, appendMessage, isLoading } = useCopilotChat();

  const sendMessage = (content: string) => {
    appendMessage(new TextMessage({ content, role: MessageRole.User }));
  };

  return (
    <motion.div layout className="flex flex-col h-screen w-screen">
      {/* Hero always visible and occupies top 40% */}
      <div className="h-[40vh] w-full">
        <Hero
          title="Sealos Brain"
          subtitle="We have lingered in the chambers of the sea. By sea-girls wreathed with seaweed red and brown"
          titleClassName="text-5xl md:text-6xl font-extrabold"
          subtitleClassName="text-lg md:text-xl max-w-[600px]"
          actionsClassName="mt-4"
          className="min-h-full"
        />
      </div>

      {/* AI Prompt directly beneath the hero */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-3xl mx-auto"
      >
        <AI_Prompt className="max-w-3xl" onSend={sendMessage} />
      </motion.div>

      {/* Message list fills the remaining space */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 w-full overflow-hidden"
      >
        <ScrollArea className="h-full">
          <ChatMessageList className="rounded-xl max-w-3xl mx-auto">
            {visibleMessages.map((message) => {
              let variant: "sent" | "received" = "received";
              let content: string = "";

              if (message.isTextMessage && message.isTextMessage()) {
                const textMsg = message as TextMessage;
                variant =
                  textMsg.role === MessageRole.User ? "sent" : "received";
                content = textMsg.content;
              } else {
                content = JSON.stringify(message);
              }

              return (
                <ChatBubble key={message.id} variant={variant}>
                  <ChatBubbleMessage variant={variant}>{content}</ChatBubbleMessage>
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
