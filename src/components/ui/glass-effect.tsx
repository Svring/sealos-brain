import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string
  height?: string
  children?: React.ReactNode
}

const Glass = React.forwardRef<HTMLDivElement, GlassProps>(
  (
    {
      className,
      children,
      width = "w-[360px] lg:w-[900px]",
      height = "h-[40px]",
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          "relative overflow-hidden",
          width,
          height,
          className
        )}
        ref={ref}
        {...props}
      >
        {/* glass background */}
        <div className="pointer-events-none absolute inset-0 z-0 w-full h-full overflow-hidden border border-[#f5f5f51a] rounded-2xl">
          <div className="glass-effect h-full w-full" />
        </div>

        {/* content */}
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
          {children}
        </div>

        {/* fractal noise filter definition (hidden) */}
        <svg className="hidden">
          <defs>
            <filter id="fractal-noise-glass">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.12 0.12"
                numOctaves="1"
                result="warp"
              />
              <feDisplacementMap
                xChannelSelector="R"
                yChannelSelector="G"
                scale="30"
                in="SourceGraphic"
                in2="warp"
              />
            </filter>
          </defs>
        </svg>
      </div>
    )
  }
)
Glass.displayName = "Glass"

export { Glass }