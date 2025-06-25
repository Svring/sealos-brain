"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

interface GraphBackMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  graphName: string;
  backHref?: string;
}

export function GraphBackMenu({
  graphName,
  backHref = "/graph",
  className,
  ...props
}: GraphBackMenuProps) {
  const [isBackHovered, setIsBackHovered] = React.useState(false);

  const displayName = graphName?.startsWith("graph-") ? graphName : graphName;

  return (
    <div className={cn("relative", className)} {...props}>
      <div
        className={cn(
          "z-10 inline-flex h-10 items-center justify-center gap-2 overflow-hidden px-1",
          "rounded-lg bg-background/95 backdrop-blur",
          "border border-border/50",
          "shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_16px_-4px_rgba(0,0,0,0.1)]",
          "dark:border-border/50 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_16px_-4px_rgba(0,0,0,0.2)]"
        )}
      >
        <Link href={backHref}>
          <motion.button
            className="flex h-8 w-8 items-center justify-center rounded-lg px-2 py-1 transition-colors hover:bg-muted/80"
            onMouseEnter={() => setIsBackHovered(true)}
            onMouseLeave={() => setIsBackHovered(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Graphs</span>
          </motion.button>
        </Link>

        <div className="h-6 w-px bg-border/50" />

        <div className="px-2 py-1">
          <p className="max-w-[200px] truncate whitespace-nowrap font-medium text-sm leading-tight">
            {displayName}
          </p>
        </div>
      </div>

      {/* Floating tooltip for back button */}
      {isBackHovered && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="-bottom-[31px] pointer-events-none absolute left-0 z-50"
          exit={{ opacity: 0, y: -5 }}
          initial={{ opacity: 0, y: -5 }}
        >
          <div
            className={cn(
              "inline-flex h-7 items-center justify-center overflow-hidden rounded-lg px-3",
              "bg-background/95 backdrop-blur",
              "border border-border/50",
              "shadow-[0_0_0_1px_rgba(0,0,0,0.08)]",
              "dark:border-border/50 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
            )}
          >
            <p className="whitespace-nowrap font-medium text-[13px] leading-tight">
              Back to Graphs
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
