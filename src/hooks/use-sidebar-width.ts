import { useEffect, useState } from "react";

/**
 * Hook to observe and return current sidebar width in pixels.
 * It listens to ResizeObserver on the sidebar container element
 * identified by the attribute `[data-slot="sidebar-container"]`.
 * Fallbacks to the provided default width when element not found.
 */
export function useSidebarWidth(defaultWidth: number = 240) {
  const [width, setWidth] = useState<number>(defaultWidth);

  useEffect(() => {
    // Attempt to find the sidebar container element
    const sidebarEl = document.querySelector<HTMLElement>(
      '[data-slot="sidebar-container"]'
    );
    if (!sidebarEl) return;

    // Initial size
    setWidth(sidebarEl.getBoundingClientRect().width);

    // Observe resize events (if supported)
    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect) {
            setWidth(entry.contentRect.width);
          }
        }
      });

      resizeObserver.observe(sidebarEl);

      return () => resizeObserver.disconnect();
    } else {
      // Fallback: listen to window resize and read width again
      const handleResize = () => {
        setWidth(sidebarEl.getBoundingClientRect().width);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return width;
}
