"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PromptInputBox } from "@/components/ai-chat/ai-prompt-box";
import { useCopilotChat } from "@copilotkit/react-core";
import { useCopilotState } from "@/context/copilot-state-provider";
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql";
import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
  ChatBubbleStatus,
} from "@/components/ai-chat/chat-bubble";
import { ChatMessageList } from "@/components/ai-chat/chat-message-list";
import { ChatErrorBoundary } from "@/components/ai-chat/chat-error-boundary";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CodeAgentState } from "@/lib/agent/code-agent";

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
  }, [
    selectedDevboxName,
    devboxOptions,
    updateConfig,
    config.project_address,
  ]);

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
    <div className="h-full flex flex-col bg-background border border-border rounded-lg">
      {/* Devbox Select - only show for code agent */}
      {config.agent === "code" && (
        <div className="p-2 border-b border-border">
          <Select value={selectedDevboxName} onValueChange={onSelectDevbox}>
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
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="flex flex-row w-full bg-background border-border rounded-lg">
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-background"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="design"
              className="data-[state=active]:bg-background"
            >
              Design
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="chat"
            className="flex-1 flex flex-col mt-0 p-2 min-h-0"
          >
            <div className="flex-1 min-h-0">
              <ChatMessageList>
                {visibleMessages.map((message) => {
                  const isTextMessage = message.isTextMessage();
                  const textMessage = isTextMessage
                    ? (message as TextMessage)
                    : null;

                  // Skip non-text messages
                  if (!isTextMessage || !textMessage?.content) {
                    return null;
                  }

                  const isUser = textMessage.role === MessageRole.User;
                  const isVisible = !hiddenMessages.has(message.id);
                  const hasError = failedMessages.has(message.id);

                  return (
                    <ChatErrorBoundary key={message.id}>
                      <ChatBubble
                        messageId={message.id}
                        variant="received"
                        isVisible={isVisible}
                      >
                        <div className="flex flex-col gap-1 flex-1">
                          <ChatBubbleMessage
                            variant="received"
                            hasError={hasError}
                            onRetry={() => handleRetryMessage(message.id)}
                            onCopy={() =>
                              handleCopyMessage(textMessage.content)
                            }
                          >
                            {textMessage.content}
                          </ChatBubbleMessage>

                          <div className="flex items-center gap-2 justify-start">
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
            <div className="flex-shrink-0 mt-2">
              <PromptInputBox onSend={handleSendMessage} />
            </div>
          </TabsContent>

          <TabsContent value="design" className="flex-1 p-4 overflow-y-auto">
            <div className="text-center text-muted-foreground mt-8">
              Design tools coming soon...
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Direct chat content for code agent */}
      {config.agent === "code" && (
        <div className="flex-1 flex flex-col min-h-0 p-2">
          <div className="flex-1 min-h-0">
            <ChatMessageList>
              {visibleMessages.map((message) => {
                const isTextMessage = message.isTextMessage();
                const textMessage = isTextMessage
                  ? (message as TextMessage)
                  : null;

                // Skip non-text messages
                if (!isTextMessage || !textMessage?.content) {
                  return null;
                }

                const isUser = textMessage.role === MessageRole.User;
                const isVisible = !hiddenMessages.has(message.id);
                const hasError = failedMessages.has(message.id);

                return (
                  <ChatErrorBoundary key={message.id}>
                    <ChatBubble
                      messageId={message.id}
                      variant="received"
                      isVisible={isVisible}
                    >

                      <div className="flex flex-col gap-1 flex-1">
                        <ChatBubbleMessage
                          variant="received"
                          hasError={hasError}
                          onRetry={() => handleRetryMessage(message.id)}
                          onCopy={() => handleCopyMessage(textMessage.content)}
                        >
                          {textMessage.content}
                        </ChatBubbleMessage>

                        <div className="flex items-center gap-2 justify-start">
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
          <div className="flex-shrink-0 mt-2">
            <PromptInputBox onSend={handleSendMessage} />
          </div>
        </div>
      )}
    </div>
  );
}
