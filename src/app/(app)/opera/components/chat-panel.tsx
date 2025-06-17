"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PromptInputBox } from "@/components/ai/ai-prompt-box";
import { useCopilotChat } from "@copilotkit/react-core";
import { useCopilotConfig } from "@/context/copilot-state-provider";
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
  ChatBubbleStatus,
} from "./chat-bubble";
import { ChatMessageList } from "./chat-message-list";
import { ChatErrorBoundary } from "./chat-error-boundary";
import { useState } from "react";

interface GeneratedFile {
  name: string;
  status: string;
}

interface ChatPanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  generatedFiles: GeneratedFile[];
}

export function ChatPanel({ activeTab, setActiveTab }: ChatPanelProps) {
  const {
    visibleMessages,
    appendMessage,
    isLoading: isChatLoading,
  } = useCopilotChat();

  const { config, updateConfig } = useCopilotConfig();
  const [projectAddress, setProjectAddress] = useState(
    config.project_address || "https://lzqezjdjzvjs.sealosbja.site"
  );

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

  const handleProjectAddressChange = (value: string) => {
    setProjectAddress(value);
    updateConfig({ project_address: value });
  };

  return (
    <div className="h-full flex flex-col bg-background border border-border rounded-lg">
      {/* Project Address Input - only show for code agent */}
      {config.agent === "code" && (
        <div className="p-2 border-b border-border">
          <div>
            <Input
              id="project-address"
              placeholder="https://lzqezjdjzvjs.sealosbja.site"
              value={projectAddress}
              onChange={(e) => handleProjectAddressChange(e.target.value)}
              className="mt-1"
            />
          </div>
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
                        <ChatBubbleAvatar
                          className="h-8 w-8 shrink-0"
                          src={
                            isUser
                              ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop"
                              : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                          }
                          fallback={isUser ? "US" : "AI"}
                          isOnline={!isUser}
                          isTyping={
                            !isUser &&
                            isChatLoading &&
                            message.id ===
                              visibleMessages[visibleMessages.length - 1]?.id
                          }
                        />

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
                      <ChatBubbleAvatar
                        className="h-8 w-8 shrink-0"
                        src={
                          isUser
                            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop"
                            : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                        }
                        fallback={isUser ? "US" : "AI"}
                        isOnline={!isUser}
                        isTyping={
                          !isUser &&
                          isChatLoading &&
                          message.id ===
                            visibleMessages[visibleMessages.length - 1]?.id
                        }
                      />

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
