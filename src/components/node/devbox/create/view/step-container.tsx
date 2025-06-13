import React from "react";

interface StepContainerProps {
  children: React.ReactNode;
}

/**
 * StepContainer provides a consistent wrapper for each step in the devbox
 * creation flow. It enforces a fixed height, consistent width, and a
 * scrollable content area to prevent layout shifts between steps.
 */
export default function StepContainer({ children }: StepContainerProps) {
  return (
    <div className="h-[70vh] overflow-y-auto rounded-lg bg-background p-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {children}
      </div>
    </div>
  );
} 