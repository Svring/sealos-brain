"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, AlertCircle, Check } from "lucide-react";
import { MessageLoading } from "@/components/ai/message-loading";
import { toast } from "sonner";

interface ChatBubbleProps {
  variant?: "sent" | "received";
  className?: string;
  children: React.ReactNode;
  messageId?: string;
  isVisible?: boolean;
}

export function ChatBubble({
  variant = "received",
  className,
  children,
  messageId,
  isVisible = true,
}: ChatBubbleProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 0.3,
          }}
          className={cn(
            "flex items-start gap-2 mb-4 group",
            variant === "sent" && "flex-row-reverse",
            className
          )}
          id={messageId}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ChatBubbleMessageProps {
  variant?: "sent" | "received";
  isLoading?: boolean;
  hasError?: boolean;
  className?: string;
  children?: React.ReactNode;
  onRetry?: () => void;
  onCopy?: () => void;
  showActions?: boolean;
}

export function ChatBubbleMessage({
  variant = "received",
  isLoading,
  hasError,
  className,
  children,
  onRetry,
  onCopy,
  showActions = true,
}: ChatBubbleMessageProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (onCopy) {
      onCopy();
    } else if (typeof children === "string") {
      try {
        await navigator.clipboard.writeText(children);
        setCopied(true);
        toast.success("Message copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Failed to copy message");
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={cn(
          "rounded-lg p-3 py-1.5 relative",
          variant === "sent"
            ? "bg-primary text-primary-foreground ml-auto"
            : "bg-muted",
          hasError && "border-destructive border",
          isLoading && "animate-pulse",
          className
        )}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <MessageLoading />
            <span className="text-sm text-muted-foreground">Thinking...</span>
          </div>
        ) : hasError ? (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm">Failed to send message</span>
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {children}
          </div>
        )}
      </motion.div>
    </div>
  );
}



interface ChatBubbleActionProps {
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export function ChatBubbleAction({
  icon,
  onClick,
  className,
  disabled,
  "aria-label": ariaLabel,
}: ChatBubbleActionProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-6 w-6 hover:scale-110 transition-transform", className)}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {icon}
    </Button>
  );
}

export function ChatBubbleActionWrapper({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-center gap-1", className)}
    >
      {children}
    </motion.div>
  );
}

// Helper component for message timestamps
interface ChatBubbleTimestampProps {
  timestamp?: Date;
  className?: string;
}

export function ChatBubbleTimestamp({
  timestamp,
  className,
}: ChatBubbleTimestampProps) {
  if (!timestamp) return null;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn("text-xs text-muted-foreground px-1", className)}>
      {formatTime(timestamp)}
    </div>
  );
}

// Helper component for message status
interface ChatBubbleStatusProps {
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  className?: string;
}

export function ChatBubbleStatus({ status, className }: ChatBubbleStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "sending":
        return (
          <div className="w-3 h-3 border border-muted-foreground border-t-transparent rounded-full animate-spin" />
        );
      case "sent":
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case "delivered":
        return (
          <div className="flex">
            <Check className="w-3 h-3 text-muted-foreground" />
            <Check className="w-3 h-3 text-muted-foreground -ml-1" />
          </div>
        );
      case "read":
        return (
          <div className="flex">
            <Check className="w-3 h-3 text-blue-500" />
            <Check className="w-3 h-3 text-blue-500 -ml-1" />
          </div>
        );
      case "failed":
        return <AlertCircle className="w-3 h-3 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex items-center justify-end", className)}>
      {getStatusIcon()}
    </div>
  );
}
