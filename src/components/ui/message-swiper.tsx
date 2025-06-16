import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Message,
  MessageRole,
  TextMessage,
} from "@copilotkit/runtime-client-gql";

interface MessageSwiperProps {
  messages: Message[];
  className?: string;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  isExpanded?: boolean;
}

export const MessageSwiper: React.FC<MessageSwiperProps> = ({
  messages,
  className = "",
  currentIndex = 0,
  onIndexChange,
  isExpanded = false,
}) => {
  const messageContentRef = useRef<HTMLDivElement>(null);
  const [localIndex, setLocalIndex] = useState(currentIndex);
  const [direction, setDirection] = useState(0); // -1 = back, 1 = forward

  const filteredMessages = messages.filter(
    (msg): msg is TextMessage =>
      msg.type === "TextMessage" &&
      typeof (msg as TextMessage).content === "string" &&
      (msg as TextMessage).content.trim().length > 0
  );

  const activeIndex = onIndexChange ? currentIndex : localIndex;
  const setIndex = onIndexChange || setLocalIndex;
  const currentMessage = filteredMessages[activeIndex];

  useEffect(() => {
    if (filteredMessages.length > 0) {
      setLocalIndex(filteredMessages.length - 1);
    }
  }, [filteredMessages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handleSwipe(-1);
      else if (e.key === "ArrowRight") handleSwipe(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, filteredMessages.length]);

  const handleSwipe = (delta: number) => {
    const newIndex = activeIndex + delta;
    if (newIndex >= 0 && newIndex < filteredMessages.length) {
      setDirection(delta);
      setIndex(newIndex);
    }
  };

  if (!currentMessage) return null;

  const content = currentMessage.content?.toString().trim();
  const role =
    currentMessage.role === MessageRole.Assistant ? "Assistant" : "User";

  return (
    <motion.div
      ref={messageContentRef}
      className={`bg-card text-card-foreground border border-border rounded-xl shadow-lg overflow-hidden w-[98%] mx-auto ${className}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{
        opacity: 1,
        height: isExpanded ? "auto" : "42px",
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.1,
      }}
    >
      <motion.div
        className="px-3 py-2 h-full flex flex-col"
        animate={{ paddingBottom: isExpanded ? "20px" : "40px" }}
        transition={{ duration: 0.1 }}
      >
        <div className="flex items-center justify-between mb-1 text-xs font-medium">
          <div>{role}</div>
          <div className="text-muted-foreground">
            {currentMessage.createdAt?.toLocaleTimeString()}
          </div>
        </div>

        <motion.div
          className="flex-1 overflow-hidden"
          animate={{ maxHeight: isExpanded ? "200px" : "42px" }}
          transition={{ duration: 0.1 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              transition={{ type: "tween", duration: 0.1, ease: "easeInOut" }}
            >
              <p className="text-sm leading-relaxed text-foreground overflow-y-auto">
                {content}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {isExpanded && filteredMessages.length > 1 && (
          <AnimatePresence>
            <motion.div
              className="flex justify-between items-center mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.1 }}
            >
              <button
                onClick={() => handleSwipe(-1)}
                disabled={activeIndex === 0}
                className="rounded-full hover:bg-muted transition-colors disabled:text-muted-foreground disabled:hover:bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-muted-foreground">
                {activeIndex + 1} / {filteredMessages.length}
              </span>
              <button
                onClick={() => handleSwipe(1)}
                disabled={activeIndex === filteredMessages.length - 1}
                className="rounded-full hover:bg-muted transition-colors disabled:text-muted-foreground disabled:hover:bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  );
};
