"use client";

// Force dynamic rendering since the layout uses headers()
export const dynamic = "force-dynamic";

import { useCopilotChat } from "@copilotkit/react-core";
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { AI_Prompt } from "@/components/ai-chat/animated-ai-input";
import {
  ChatBubble,
  ChatBubbleMessage,
} from "@/components/ai-chat/chat-bubble";
import { ChatMessageList } from "@/components/ai-chat/chat-message-list";
import { Hero } from "@/components/ui/hero";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Disclosure,
  DisclosureTrigger,
  DisclosureContent,
} from "@/components/ui/disclosure";

import { CopilotStateProvider } from "@/context/copilot-state-provider";

function Home() {
  const { visibleMessages, appendMessage, isLoading } = useCopilotChat();

  const sendMessage = (content: string) => {
    appendMessage(new TextMessage({ content, role: MessageRole.User }));
  };

  const hasMessages = visibleMessages.length > 0;

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
              {visibleMessages.map((message) => {
                // Handle text messages normally
                if (message.isTextMessage?.()) {
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
                }

                // Handle non-text messages as collapsible JSON
                const variant = "received"; // Non-text messages are typically system/agent messages

                return (
                  <ChatBubble key={message.id} variant={variant}>
                    <ChatBubbleMessage variant={variant}>
                      <div className="font-mono text-sm">
                        <Disclosure open={false}>
                          <DisclosureTrigger>
                            <div className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-muted/50">
                              <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                              <div className="text-xs text-muted-foreground">
                                {message.type} Message
                              </div>
                            </div>
                          </DisclosureTrigger>
                          <DisclosureContent>
                            <pre className="mt-2 whitespace-pre-wrap break-words rounded bg-muted p-2 text-xs">
                              {JSON.stringify(message, null, 2)}
                            </pre>
                          </DisclosureContent>
                        </Disclosure>
                      </div>
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
