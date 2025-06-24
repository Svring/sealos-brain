"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface GraphBackMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  graphName: string
  backHref?: string
}

export function GraphBackMenu({ 
  graphName, 
  backHref = "/graph", 
  className, 
  ...props 
}: GraphBackMenuProps) {
  const [isBackHovered, setIsBackHovered] = React.useState(false)

  const displayName = graphName === "new-graph" ? "New Graph" : graphName

  return (
    <div className={cn("relative", className)} {...props}>
      <div 
        className={cn(
          "h-10 px-1 inline-flex justify-center items-center gap-2 overflow-hidden z-10",
          "rounded-lg bg-background/95 backdrop-blur",
          "border border-border/50",
          "shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_16px_-4px_rgba(0,0,0,0.1)]",
          "dark:border-border/50 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_16px_-4px_rgba(0,0,0,0.2)]"
        )}
      >
        <Link href={backHref}>
          <motion.button
            className="w-8 h-8 px-2 py-1 rounded-lg flex justify-center items-center hover:bg-muted/80 transition-colors"
            onMouseEnter={() => setIsBackHovered(true)}
            onMouseLeave={() => setIsBackHovered(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="sr-only">Back to Graphs</span>
          </motion.button>
        </Link>
        
        <div className="h-6 w-px bg-border/50" />
        
        <div className="px-2 py-1">
          <p className="text-sm font-medium leading-tight whitespace-nowrap max-w-[200px] truncate">
            {displayName}
          </p>
        </div>
      </div>

      {/* Floating tooltip for back button */}
      {isBackHovered && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="absolute left-0 -bottom-[31px] pointer-events-none z-50"
        >
          <div
            className={cn(
              "h-7 px-3 rounded-lg inline-flex justify-center items-center overflow-hidden",
              "bg-background/95 backdrop-blur",
              "border border-border/50",
              "shadow-[0_0_0_1px_rgba(0,0,0,0.08)]",
              "dark:border-border/50 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
            )}
          >
            <p className="text-[13px] font-medium leading-tight whitespace-nowrap">
              Back to Graphs
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
