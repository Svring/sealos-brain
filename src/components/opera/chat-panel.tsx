"use client";

import { useCopilotChat } from "@copilotkit/react-core";
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql";
import { useEffect, useState } from "react";
import { PromptInputBox } from "@/components/ai-chat/ai-prompt-box";
import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleStatus,
  ChatBubbleTimestamp,
} from "@/components/ai-chat/chat-bubble";
import { ChatErrorBoundary } from "@/components/ai-chat/chat-error-boundary";
import { ChatMessageList } from "@/components/ai-chat/chat-message-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCopilotState } from "@/context/copilot-state-provider";
import type { CodeAgentState } from "@/lib/agent/code-agent";

interface DevboxOption {
  name: string;
  preview_address: string;
  galatea_address: string;
}

interface ChatPanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  devboxOptions: DevboxOption[];
  selectedDevboxName: string;
  onSelectDevbox: (name: string) => void;
}

export function ChatPanel({
  activeTab,
  setActiveTab,
  devboxOptions,
  selectedDevboxName,
  onSelectDevbox,
}: ChatPanelProps) {
  const {
    visibleMessages,
    appendMessage,
    isLoading: isChatLoading,
  } = useCopilotChat();

  const { config, updateConfig, setState } = useCopilotState();

  // Update Copilot config and agent state when selected devbox changes
  useEffect(() => {
    const selected = devboxOptions.find((d) => d.name === selectedDevboxName);
    if (selected) {
      const newAddress = selected.galatea_address;
      if (newAddress) {
        // Update context config (triggers agent re-initialization via re-keying)
        if (newAddress !== config.project_address) {
          console.log("Selected devbox:", selectedDevboxName);
          console.log("Galatea address:", newAddress);
          console.log("Preview address:", selected.preview_address);
          console.log(
            "Updating project_address from:",
            config.project_address,
            "to:",
            newAddress
          );
          updateConfig({ project_address: newAddress });
        }

        // Update agent's internal state using centralized setState
        setState((prevState) => ({
          ...(prevState as CodeAgentState),
          project_address: newAddress,
        }));
      }
    }
  }, [selectedDevboxName, devboxOptions, updateConfig, config.project_address]);

  const [failedMessages, setFailedMessages] = useState<Set<string>>(new Set());
  const [hiddenMessages] = useState<Set<string>>(new Set());

  const handleSendMessage = (message: string) => {
    appendMessage(
      new TextMessage({ content: message, role: MessageRole.User })
    );
  };

  const handleRetryMessage = (messageId: string) => {
    const message = visibleMessages.find((msg) => msg.id === messageId);
    if (message && message.isTextMessage()) {
      // Remove from failed messages
      setFailedMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });

      // Resend the message
      appendMessage(
        new TextMessage({
          content: (message as TextMessage).content,
          role: MessageRole.User,
        })
      );
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-background">
      {/* Devbox Select - only show for code agent */}
      {config.agent === "code" && (
        <div className="border-border border-b p-2">
          <Select onValueChange={onSelectDevbox} value={selectedDevboxName}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Devbox" />
            </SelectTrigger>
            <SelectContent>
              {devboxOptions.map((opt) => (
                <SelectItem key={opt.name} value={opt.name}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Chat/Design Tabs - keep for non-code agents or fallback */}
      {config.agent !== "code" && (
        <Tabs
          className="flex min-h-0 flex-1 flex-col"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="flex w-full flex-row rounded-lg border-border bg-background">
            <TabsTrigger
              className="data-[state=active]:bg-background"
              value="chat"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-background"
              value="design"
            >
              Design
            </TabsTrigger>
          </TabsList>

          <TabsContent
            className="mt-0 flex min-h-0 flex-1 flex-col p-2"
            value="chat"
          >
            <div className="min-h-0 flex-1">
              <ChatMessageList>
                {visibleMessages.map((message) => {
                  const isTextMessage = message.isTextMessage();
                  const textMessage = isTextMessage
                    ? (message as TextMessage)
                    : null;

                  // Skip non-text messages
                  if (!(isTextMessage && textMessage?.content)) {
                    return null;
                  }

                  const isUser = textMessage.role === MessageRole.User;
                  const isVisible = !hiddenMessages.has(message.id);
                  const hasError = failedMessages.has(message.id);

                  return (
                    <ChatErrorBoundary key={message.id}>
                      <ChatBubble
                        isVisible={isVisible}
                        messageId={message.id}
                        variant="received"
                      >
                        <div className="flex flex-1 flex-col gap-1">
                          <ChatBubbleMessage
                            hasError={hasError}
                            onCopy={() =>
                              handleCopyMessage(textMessage.content)
                            }
                            onRetry={() => handleRetryMessage(message.id)}
                            variant="received"
                          >
                            {textMessage.content}
                          </ChatBubbleMessage>

                          <div className="flex items-center justify-start gap-2">
                            <ChatBubbleTimestamp
                              timestamp={message.createdAt}
                            />
                            {isUser && (
                              <ChatBubbleStatus
                                status={hasError ? "failed" : "sent"}
                              />
                            )}
                          </div>
                        </div>
                      </ChatBubble>
                    </ChatErrorBoundary>
                  );
                })}
              </ChatMessageList>
            </div>

            {/* Chat Input - Fixed at bottom */}
            <div className="mt-2 flex-shrink-0">
              <PromptInputBox onSend={handleSendMessage} />
            </div>
          </TabsContent>

          <TabsContent className="flex-1 overflow-y-auto p-4" value="design">
            <div className="mt-8 text-center text-muted-foreground">
              Design tools coming soon...
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Direct chat content for code agent */}
      {config.agent === "code" && (
        <div className="flex min-h-0 flex-1 flex-col p-2">
          <div className="min-h-0 flex-1">
            <ChatMessageList>
              {visibleMessages.map((message) => {
                const isTextMessage = message.isTextMessage();
                const textMessage = isTextMessage
                  ? (message as TextMessage)
                  : null;

                // Skip non-text messages
                if (!(isTextMessage && textMessage?.content)) {
                  return null;
                }

                const isUser = textMessage.role === MessageRole.User;
                const isVisible = !hiddenMessages.has(message.id);
                const hasError = failedMessages.has(message.id);

                return (
                  <ChatErrorBoundary key={message.id}>
                    <ChatBubble
                      isVisible={isVisible}
                      messageId={message.id}
                      variant="received"
                    >
                      <div className="flex flex-1 flex-col gap-1">
                        <ChatBubbleMessage
                          hasError={hasError}
                          onCopy={() => handleCopyMessage(textMessage.content)}
                          onRetry={() => handleRetryMessage(message.id)}
                          variant="received"
                        >
                          {textMessage.content}
                        </ChatBubbleMessage>

                        <div className="flex items-center justify-start gap-2">
                          <ChatBubbleTimestamp timestamp={message.createdAt} />
                          {isUser && (
                            <ChatBubbleStatus
                              status={hasError ? "failed" : "sent"}
                            />
                          )}
                        </div>
                      </div>
                    </ChatBubble>
                  </ChatErrorBoundary>
                );
              })}
            </ChatMessageList>
          </div>

          {/* Chat Input - Fixed at bottom */}
          <div className="mt-2 flex-shrink-0">
            <PromptInputBox onSend={handleSendMessage} />
          </div>
        </div>
      )}
    </div>
  );
}
