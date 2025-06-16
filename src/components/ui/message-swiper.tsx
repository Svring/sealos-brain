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
  console.log("🔍 Messages:", messages);
  // Filter out only TextMessage types with non-empty content
  const filteredMessages = messages.filter((msg) => {
    if (
      msg.type === "TextMessage" &&
      msg.isTextMessage &&
      msg.isTextMessage()
    ) {
      const content = (msg as TextMessage).content;
      return typeof content === "string" && content.trim().length > 0;
    }
    return false; // Only allow TextMessage
  });

  const [localCurrentIndex, setLocalCurrentIndex] = useState(currentIndex);
  const [direction, setDirection] = useState(0); // -1 for backward, 1 for forward
  const messageContentRef = useRef<HTMLDivElement>(null);

  // Use controlled or uncontrolled index
  const activeIndex = onIndexChange ? currentIndex : localCurrentIndex;
  const setActiveIndex = onIndexChange || setLocalCurrentIndex;

  const handlePrevMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex > 0) {
      setDirection(-1);
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleNextMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex < filteredMessages.length - 1) {
      setDirection(1);
      setActiveIndex(activeIndex + 1);
    }
  };

  // Set direction when index changes externally (new message)
  useEffect(() => {
    if (onIndexChange && currentIndex > activeIndex) {
      setDirection(1);
    }
  }, [currentIndex, activeIndex, onIndexChange]);

  if (filteredMessages.length === 0) {
    return null;
  }

  const currentMessage = filteredMessages[activeIndex];
  if (!currentMessage) {
    return null;
  }

  // Fade in/out variants for message transitions
  const fadeVariants = {
    enter: {
      opacity: 0,
    },
    center: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  };

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
        animate={{
          paddingBottom: isExpanded ? "20px" : "40px",
        }}
        transition={{ duration: 0.1 }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="rounded-full text-xs font-medium">
            {currentMessage.isTextMessage() &&
            (currentMessage as TextMessage).role === MessageRole.Assistant
              ? "Assistant"
              : "User"}
          </div>
          {currentMessage && currentMessage.createdAt && (
            <div className="text-xs text-muted-foreground">
              {currentMessage.createdAt.toLocaleTimeString()}
            </div>
          )}
        </div>
        <motion.div
          className="flex-1 overflow-hidden"
          animate={{
            maxHeight: isExpanded ? "200px" : "42px",
          }}
          transition={{ duration: 0.1 }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={fadeVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: "tween",
                duration: 0.1,
                ease: "easeInOut",
              }}
            >
              <p className="text-sm leading-relaxed text-foreground overflow-y-auto">
                {currentMessage.isTextMessage() &&
                  (currentMessage as TextMessage).content}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {isExpanded && filteredMessages.length > 1 && (
            <motion.div
              className="flex justify-between items-center mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.1 }}
            >
              <button
                onClick={handlePrevMessage}
                disabled={activeIndex === 0}
                className="rounded-full hover:bg-muted transition-colors disabled:text-muted-foreground disabled:hover:bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {activeIndex + 1} / {filteredMessages.length}
                </span>
              </div>
              <button
                onClick={handleNextMessage}
                disabled={activeIndex === filteredMessages.length - 1}
                className="rounded-full hover:bg-muted transition-colors disabled:text-muted-foreground disabled:hover:bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
