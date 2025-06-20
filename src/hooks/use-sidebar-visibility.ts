import { useState } from "react";

interface UseSidebarVisibilityOptions {
  defaultOpen?: boolean;
}

export function useSidebarVisibility({
  defaultOpen = true,
}: UseSidebarVisibilityOptions = {}) {
  const [open, setOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    setOpen(!open);
  };

  return {
    open,
    setOpen,
    toggleOpen,
    // Legacy compatibility - no-ops
    pinned: false,
    enterHotZone: () => {},
    leaveSidebar: () => {},
    enterSidebar: () => {},
    togglePin: toggleOpen, // Map to toggle for backward compatibility
  };
}
