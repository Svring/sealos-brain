import { useRef, useState } from "react";

interface UseSidebarResizeOptions {
  initialWidth?: number;
  minWidth?: number;
}

/**
 * Encapsulates the mouse-driven horizontal resize behaviour of the floating
 * sidebar so that the UI component no longer needs to juggle refs and
 * listeners directly.
 */
export function useSidebarResize({
  initialWidth = 280,
  minWidth = 180,
}: UseSidebarResizeOptions = {}) {
  const [width, setWidth] = useState(initialWidth);
  const resizingRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    resizingRef.current = true;
    document.body.style.cursor = "ew-resize";
    const startX = e.clientX;
    const startWidth = width;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingRef.current) return;
      const newWidth = Math.max(
        minWidth,
        startWidth + (moveEvent.clientX - startX)
      );
      setWidth(newWidth);
    };

    const onMouseUp = () => {
      resizingRef.current = false;
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return { width, handleMouseDown };
}
