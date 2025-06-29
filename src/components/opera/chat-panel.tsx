"use client";

import { useCopilotChat } from "@copilotkit/react-core";
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql";
import { useState } from "react";
import { PromptInputBox } from "@/components/ai-chat/ai-prompt-box";
import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleStatus,
  ChatBubbleTimestamp,
} from "@/components/ai-chat/chat-bubble";
import { ChatErrorBoundary } from "@/components/ai-chat/chat-error-boundary";
import { ChatMessageList } from "@/components/ai-chat/chat-message-list";

interface ChatPanelProps {
  devboxName: string;
  devpodAddress?: string;
}

export function ChatPanel({ devboxName }: ChatPanelProps) {
  const { visibleMessages, appendMessage } = useCopilotChat();
  const [failedMessages, setFailedMessages] = useState<Set<string>>(new Set());
  const [hiddenMessages] = useState<Set<string>>(new Set());

  const handleSendMessage = (message: string) => {
    appendMessage(
      new TextMessage({ content: message, role: MessageRole.User })
    );
  };

  const handleRetryMessage = (messageId: string) => {
    const message = visibleMessages.find((msg) => msg.id === messageId);
    if (message?.isTextMessage()) {
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
      {/* Devbox Info Header */}
      <div className="border-border border-b p-3">
        <div className="font-medium text-sm">Devbox: {devboxName}</div>
      </div>

      {/* Chat Messages */}
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
                    variant={isUser ? "sent" : "received"}
                  >
                    <div className="flex flex-1 flex-col gap-1">
                      <ChatBubbleMessage
                        hasError={hasError}
                        onCopy={() => handleCopyMessage(textMessage.content)}
                        onRetry={() => handleRetryMessage(message.id)}
                        variant={isUser ? "sent" : "received"}
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
    </div>
  );
}
