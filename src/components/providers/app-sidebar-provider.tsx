'use client'
import React, { useRef, useState } from "react";
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Pin, PinOff } from "lucide-react";

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const resizing = useRef(false);

  // Open sidebar when mouse enters hot zone
  const handleHotZoneEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setOpen(true);
  };

  // Start close timer when mouse leaves both sidebar and hot zone
  const handleSidebarLeave = () => {
    if (pinned) return;
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => setOpen(false), 100);
  };

  // Cancel close if mouse re-enters sidebar
  const handleSidebarEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
  };

  // Pin/unpin handler
  const handlePinClick = () => {
    setPinned((prev) => {
      const isNowPinned = !prev;
      if (isNowPinned) {
        setOpen(true);
      }
      return isNowPinned;
    });
  };

  // --- Resize logic ---
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    document.body.style.cursor = 'ew-resize';
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!resizing.current) return;
      const newWidth = Math.max(180, startWidth + (moveEvent.clientX - startX));
      setSidebarWidth(newWidth);
    };
    const onMouseUp = () => {
      resizing.current = false;
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <>
      {/* Hot zone: only active when sidebar is closed and not pinned */}
      {!open && !pinned && (
        <div
          className="fixed left-0 top-0 w-12 h-screen z-[100]"
          onMouseEnter={handleHotZoneEnter}
        />
      )}
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <Sidebar
          variant="floating"
          className="fixed top-0 left-0 h-full z-50"
          style={{ width: sidebarWidth }}
          onMouseEnter={handleSidebarEnter}
          onMouseLeave={handleSidebarLeave}
          header={
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 left-2 z-50"
              onClick={handlePinClick}
              aria-label={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
              type="button"
            >
              {pinned ? (
                <PinOff className="w-4 h-4" />
              ) : (
                <Pin className="w-4 h-4" />
              )}
            </Button>
          }
        >
          {/* Resize handle */}
          <div
            className="absolute top-0 right-0 h-full w-2 cursor-ew-resize z-50 bg-transparent transition-colors"
            onMouseDown={handleResizeMouseDown}
            style={{ userSelect: 'none' }}
          />
          <SidebarContent />
        </Sidebar>
      </SidebarProvider>
    </>
  );
}