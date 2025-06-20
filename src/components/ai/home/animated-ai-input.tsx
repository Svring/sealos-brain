"use client";

import { ArrowRight } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;

      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

interface AI_PromptProps {
  className?: string;
  onSend?: (value: string) => void;
}

export function AI_Prompt({ className, onSend }: AI_PromptProps = {}) {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 300,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && value.trim()) {
      e.preventDefault();
      const message = value.trim();
      if (onSend) onSend(message);
      setValue("");
      adjustHeight(true);
    }
  };

  return (
    <div className={cn("w-full py-4 max-w-5xl", className)}>
      <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-1.5">
        <div className="relative">
          <div className="relative flex flex-col">
            <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
              <Textarea
                id="ai-input-15"
                value={value}
                placeholder={"Ready when you are."}
                className={cn(
                  "w-full rounded-xl rounded-b-none px-4 py-3 bg-black/5 dark:bg-white/5 border-none dark:text-white placeholder:text-black/70 dark:placeholder:text-white/70 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 !text-base",
                  "min-h-[72px]"
                )}
                ref={textareaRef}
                onKeyDown={handleKeyDown}
                onChange={(e) => {
                  setValue(e.target.value);
                  adjustHeight();
                }}
              />
            </div>

            <div className="h-14 bg-black/5 dark:bg-white/5 rounded-b-xl flex items-center justify-end px-3">
              <button
                type="button"
                className={cn(
                  "rounded-lg p-2 bg-black/5 dark:bg-white/5",
                  "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
                )}
                aria-label="Send message"
                disabled={!value.trim()}
                onClick={() => {
                  if (!value.trim()) return;
                  const message = value.trim();
                  if (onSend) onSend(message);
                  setValue("");
                  adjustHeight(true);
                }}
              >
                <ArrowRight
                  className={cn(
                    "w-4 h-4 dark:text-white transition-opacity duration-200",
                    value.trim() ? "opacity-100" : "opacity-30"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
