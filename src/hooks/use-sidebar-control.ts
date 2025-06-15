import { useCallback, useRef, useEffect } from "react";
import { useControlStore } from "@/store/control-store";
import type { SidebarPath } from "@/store/control/sidebar-slice";

/**
 * Hook that provides all sidebar functionality through the centralized control store.
 * This replaces the old useSidebarVisibility and useSidebarResize hooks.
 */
export function useSidebarControl() {
  const {
    sidebar,
    setSidebarVisibility,
    toggleSidebarPin,
    enterSidebarHotZone,
    leaveSidebar,
    enterSidebar,
    setSidebarOpen,
    setSidebarWidth,
    startSidebarResize,
    stopSidebarResize,
    navigateToSidebarPath,
    goBackInSidebar,
    markSidebarDataFetched,
    shouldRefreshSidebarData,
    updateSidebarSettings,
  } = useControlStore();

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resizingRef = useRef(false);

  // Enhanced visibility controls with timeout management
  const handleEnterHotZone = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    enterSidebarHotZone();
  }, [enterSidebarHotZone]);

  const handleLeaveSidebar = useCallback(() => {
    if (sidebar.visibility.pinned) return; // ignore if pinned

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = setTimeout(() => {
      setSidebarVisibility("closed");
    }, sidebar.settings.closeDelay);
  }, [
    sidebar.visibility.pinned,
    sidebar.settings.closeDelay,
    setSidebarVisibility,
  ]);

  const handleEnterSidebar = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    enterSidebar();
  }, [enterSidebar]);

  // Enhanced resize controls with mouse event handling
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      resizingRef.current = true;
      startSidebarResize();
      document.body.style.cursor = "ew-resize";

      const startX = e.clientX;
      const startWidth = sidebar.resize.width;

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!resizingRef.current) return;
        const newWidth = Math.max(
          sidebar.resize.minWidth,
          startWidth + (moveEvent.clientX - startX)
        );
        setSidebarWidth(newWidth);
      };

      const onMouseUp = () => {
        resizingRef.current = false;
        stopSidebarResize();
        document.body.style.cursor = "";
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [
      sidebar.resize.width,
      sidebar.resize.minWidth,
      setSidebarWidth,
      startSidebarResize,
      stopSidebarResize,
    ]
  );

  // Navigation helpers
  const handleNavigate = useCallback(
    (path: SidebarPath) => {
      navigateToSidebarPath(path);
    },
    [navigateToSidebarPath]
  );

  const handleBackClick = useCallback(() => {
    goBackInSidebar();
  }, [goBackInSidebar]);

  // Data fetching helpers
  const handleMarkDataFetched = useCallback(() => {
    markSidebarDataFetched();
  }, [markSidebarDataFetched]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Get current title based on path
  const getCurrentTitle = useCallback(() => {
    switch (sidebar.navigation.currentPath) {
      case "/sidebar":
        return "Sidebar";
      case "/sidebar/dashboard":
        return "Dashboard";
      case "/sidebar/graph":
        return "Graph";
      case "/sidebar/devbox":
        return "DevBox";
      case "/sidebar/database":
        return "Database";
      case "/sidebar/ai-proxy":
        return "AI Proxy";
      default:
        return "DevBox";
    }
  }, [sidebar.navigation.currentPath]);

  return {
    // State
    open: sidebar.visibility.open,
    pinned: sidebar.visibility.pinned,
    status: sidebar.visibility.status,
    width: sidebar.resize.width,
    isResizing: sidebar.resize.isResizing,
    currentPath: sidebar.navigation.currentPath,
    history: sidebar.navigation.history,
    hasInitialFetch: sidebar.dataFetch.hasInitialFetch,

    // Actions
    setOpen: setSidebarOpen,
    togglePin: toggleSidebarPin,
    enterHotZone: handleEnterHotZone,
    leaveSidebar: handleLeaveSidebar,
    enterSidebar: handleEnterSidebar,
    handleMouseDown: handleResizeMouseDown,
    navigate: handleNavigate,
    goBack: handleBackClick,
    markDataFetched: handleMarkDataFetched,
    shouldRefreshData: shouldRefreshSidebarData,
    updateSettings: updateSidebarSettings,

    // Helpers
    getCurrentTitle,
    canGoBack: sidebar.navigation.history.length > 1,
  };
}
