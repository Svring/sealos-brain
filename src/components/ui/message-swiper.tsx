import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp?: Date;
}

interface MessageSwiperProps {
  messages: Message[];
  cardWidth?: number;
  cardHeight?: number;
  className?: string;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  isExpanded?: boolean;
}

export const MessageSwiper: React.FC<MessageSwiperProps> = ({
  messages,
  cardWidth = 400,
  cardHeight = 240,
  className = '',
  currentIndex = 0,
  onIndexChange,
  isExpanded = false
}) => {
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
    if (activeIndex < messages.length - 1) {
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

  if (messages.length === 0) {
    return null;
  }

  const currentMessage = messages[activeIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      y: direction > 0 ? 30 : -30,
      opacity: 0
    }),
    center: {
      y: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      y: direction < 0 ? 30 : -30,
      opacity: 0
    })
  };

  return (
    <motion.div 
      ref={messageContentRef}
      className={`bg-card text-card-foreground border border-border rounded-xl shadow-lg overflow-hidden w-[98%] mx-auto ${className} pb-3`}
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="px-3 py-2 h-full flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <div className="rounded-full text-xs font-medium">
            Assistant Response
          </div>
          {currentMessage.timestamp && (
            <div className="text-xs text-muted-foreground">
              {currentMessage.timestamp.toLocaleTimeString()}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.3
              }}
            >
              <p className="text-sm leading-relaxed text-foreground">
                {currentMessage.content}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {isExpanded && messages.length > 1 && (
          <motion.div 
            className="flex justify-between items-center mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
                {activeIndex + 1} / {messages.length}
              </span>
            </div>
            <button 
              onClick={handleNextMessage} 
              disabled={activeIndex === messages.length - 1}
              className="rounded-full hover:bg-muted transition-colors disabled:text-muted-foreground disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};