"use client";

// React and third-party imports
import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Box,
  Database,
  Home,
  Pin,
  PinOff,
  Sparkle,
  User2,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { MainSection, NavigationItem } from "@/components/ui/sidebar-section";

// Hooks and store
import { useSealosStore } from "@/store/sealos-store";
import { useSidebarControl } from "@/hooks/use-sidebar-control";
import { accountAmountOptions } from "@/lib/account/account-query";

// Utils
import { transformAccountAmountIntoBalance } from "@/lib/account/account-transform";

// Constants
const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "Dashboard",
    icon: Home,
    group: "overview",
  },
  {
    title: "Graph",
    icon: BarChart3,
    group: "overview",
  },
  {
    title: "DevBox",
    icon: Box,
    group: "application",
  },
  {
    title: "Database",
    icon: Database,
    group: "application",
  },
  {
    title: "AI Proxy",
    icon: Sparkle,
    group: "application",
  },
];

// Main component
export function AppSidebar() {
  // Store and hooks
  const { currentUser, regionUrl } = useSealosStore();

  const { data: accountAmountData, isLoading: accountLoading } = useQuery(
    accountAmountOptions(
      currentUser,
      regionUrl,
      transformAccountAmountIntoBalance
    )
  );

  const {
    open,
    pinned,
    width: sidebarWidth,
    setOpen,
    togglePin: handlePinClick,
    enterHotZone: handleHotZoneEnter,
    leaveSidebar: handleSidebarLeave,
    enterSidebar: handleSidebarEnter,
    handleMouseDown: handleResizeMouseDown,
  } = useSidebarControl();

  // Render
  return (
    <>
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
        >
          <div
            className="absolute top-0 right-0 h-full w-2 cursor-ew-resize z-50 bg-transparent transition-colors"
            onMouseDown={handleResizeMouseDown}
            style={{ userSelect: "none" }}
          />
          <SidebarHeader className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <span className="pl-2 text-sm font-medium">Sidebar</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePinClick}
                aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
                className="h-8 w-8"
              >
                {pinned ? (
                  <PinOff className="w-4 h-4" />
                ) : (
                  <Pin className="w-4 h-4" />
                )}
              </Button>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <MainSection navigationItems={NAVIGATION_ITEMS} />
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SpotlightCard className="p-2 mb-2 rounded-lg h-10">
                  <div className="text-sm text-[var(--paragraph-text)] flex items-center justify-center h-full">
                    <span className="font-semibold text-[var(--heading-text)]">
                      Balance:
                    </span>{" "}
                    <span className="text-foreground ml-1">
                      {accountLoading ? "Loading..." : accountAmountData}
                    </span>
                  </div>
                </SpotlightCard>
                <div className="relative px-3 py-2 flex items-center gap-2">
                  <User2 className="w-4 h-4 relative z-10" />
                  <span className="text-sm relative z-10">
                    {currentUser?.username || currentUser?.email || "User"}
                  </span>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    </>
  );
}
