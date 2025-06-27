import { ArrowDown } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { useAutoScroll } from "@/hooks/use-auto-scroll";

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  smooth?: boolean;
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ className, children, smooth = false, ...props }, _ref) => {
    const {
      scrollRef,
      isAtBottom,
      autoScrollEnabled,
      scrollToBottom,
      disableAutoScroll,
    } = useAutoScroll({
      smooth,
      content: children,
    });

    return (
      <div className="relative h-full w-full">
        <div
          className={`scrollbar-hide flex h-full w-full flex-col overflow-y-auto p-4 ${className}`}
          onTouchMove={disableAutoScroll}
          onWheel={disableAutoScroll}
          ref={scrollRef}
          {...props}
        >
          <div className="flex flex-col gap-2">{children}</div>
        </div>

        {!isAtBottom && (
          <Button
            aria-label="Scroll to bottom"
            className="-translate-x-1/2 absolute bottom-2 left-1/2 inline-flex transform rounded-full shadow-md"
            onClick={() => {
              scrollToBottom();
            }}
            size="icon"
            variant="outline"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
);

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };
