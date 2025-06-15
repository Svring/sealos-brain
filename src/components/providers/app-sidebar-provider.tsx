"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Pin,
  PinOff,
  User2,
  ChevronUp,
  ArrowLeft,
  Home,
  Settings,
  FileText,
  Box,
  ChevronRight,
  Terminal,
  Database,
  Code,
  CreditCard,
  BarChart3,
  Sparkle,
} from "lucide-react";
import { UserCenter } from "@/components/ui/user-center";
import { getCurrentUser } from "@/database/actions/user-actions";
import { User } from "@/payload-types";
import { SpotlightCard } from "@/components/ui/spotlight-card";

import { useSealosStore } from "@/store/sealos-store";
import { useSealosAccount } from "@/hooks/use-sealos-account";
import { useSealosAuth } from "@/hooks/use-sealos-auth";
import { useDevboxSidebar } from "@/hooks/use-devbox-sidebar";
import { useSidebarResize } from "@/hooks/use-sidebar-resize";
import { useSidebarVisibility } from "@/hooks/use-sidebar-visibility";
import { SidebarPath } from "@/components/providers/sidebar/types";
import { type AccountAmountData } from "@/lib/account/schemas/account-amount-schema";
import { debounce } from "lodash";

// Import newly extracted section components
import {
  MainSection,
  DashboardSection,
  GraphSection,
  DevboxSection,
  DatabaseSection,
  AIProxySection,
  NavigationItem,
} from "@/components/sidebar/sections";

export function AppSidebar() {
  const {
    currentUser,
    regionUrl,
    setCurrentUser,
    setRegionUrl,
    getApiData,
    setApiData,
    isApiDataValid,
    hasRequiredTokens,
    debugPrintState,
  } = useSealosStore();

  const { fetchAccountAmount, getCachedAccountAmount, isAccountDataValid } =
    useSealosAccount();
  const { fetchAuthInfo, getCachedAuthInfo, isAuthDataValid } = useSealosAuth();
  const {
    devboxes: parsedDevboxes,
    rawData: devboxData,
    loading: devboxLoading,
    error: devboxError,
    refresh: refreshDevboxList,
  } = useDevboxSidebar();
  const { width: sidebarWidth, handleMouseDown: handleResizeMouseDown } =
    useSidebarResize();
  const {
    open,
    setOpen,
    pinned,
    togglePin: handlePinClick,
    enterHotZone: handleHotZoneEnter,
    leaveSidebar: handleSidebarLeave,
    enterSidebar: handleSidebarEnter,
  } = useSidebarVisibility();

  const [currentPath, setCurrentPath] = useState<SidebarPath>("/sidebar");
  const dataFetchedRef = React.useRef(false);

  // Debounced fetchAccountAmount
  const debouncedFetchAccountAmount = useCallback(
    debounce(async () => {
      try {
        await fetchAccountAmount();
      } catch (error) {
        console.error("Failed to fetch account amount:", error);
      }
    }, 500),
    [fetchAccountAmount]
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setCurrentUser(currentUser);
        if (currentUser) {
          console.log("Setting user tokens in Sealos store");
          setTimeout(() => {
            console.log("📊 Store state after setting user:");
            debugPrintState();
          }, 100);
          setTimeout(async () => {
            await fetchAccountData();
          }, 200);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setCurrentUser(null);
      }
    };

    fetchUser();
  }, [setCurrentUser, debugPrintState]);

  const fetchAccountData = async () => {
    if (!currentUser) return;
    try {
      console.log("🏦 Fetching account data in sidebar");
      const [accountAmount, authInfo] = await Promise.allSettled([
        fetchAccountAmount(),
        fetchAuthInfo(),
      ]);
      if (accountAmount.status === "fulfilled") {
        console.log(
          "✅ Account amount fetched successfully:",
          accountAmount.value
        );
      } else {
        console.error(
          "❌ Failed to fetch account amount:",
          accountAmount.reason
        );
      }
      if (authInfo.status === "fulfilled") {
        console.log("✅ Auth info fetched successfully:", authInfo.value);
      } else {
        console.error("❌ Failed to fetch auth info:", authInfo.reason);
      }
    } catch (error) {
      console.error("Error fetching account data:", error);
    }
  };

  const handleBackClick = () => {
    setCurrentPath("/sidebar");
  };

  const handleNavigate = (path: SidebarPath) => {
    setCurrentPath(path);
    if (path === "/sidebar/devbox" && currentUser) {
      refreshDevboxList();
    }
  };

  const getCurrentTitle = () => {
    switch (currentPath) {
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
  };

  const navigationItems: NavigationItem[] = [
    {
      title: "Dashboard",
      icon: Home,
      path: "/sidebar/dashboard" as SidebarPath,
      group: "overview",
    },
    {
      title: "Graph",
      icon: BarChart3,
      path: "/sidebar/graph" as SidebarPath,
      group: "overview",
    },
    {
      title: "DevBox",
      icon: Box,
      path: "/sidebar/devbox" as SidebarPath,
      group: "application",
    },
    {
      title: "Database",
      icon: Database,
      path: "/sidebar/database" as SidebarPath,
      group: "application",
    },
    {
      title: "AI Proxy",
      icon: Sparkle,
      path: "/sidebar/ai-proxy" as SidebarPath,
      group: "application",
    },
  ];

  const getAccountBalance = (): string => {
    const currentRegionUrl = regionUrl || "bja.sealos.run";
    const accountData = getCachedAccountAmount(
      currentRegionUrl
    ) as AccountAmountData | null;
    return accountData ? accountData.validBalance.toString() : "0";
  };

  useEffect(() => {
    if (currentUser && !dataFetchedRef.current) {
      dataFetchedRef.current = true;
      console.log("🚀 Sidebar: Starting centralized data fetch");
      Promise.allSettled([
        refreshDevboxList(),
        fetchAccountAmount(),
        fetchAuthInfo(),
      ]).then((results) => {
        results.forEach((result, index) => {
          const apiNames = ["devbox", "account", "auth"];
          if (result.status === "fulfilled") {
            console.log(
              `✅ Sidebar: ${apiNames[index]} data fetched successfully`
            );
          } else {
            console.error(
              `❌ Sidebar: ${apiNames[index]} data fetch failed:`,
              result.reason
            );
          }
        });
        console.log("🏁 Sidebar: Centralized data fetch completed");
      });
    }
  }, [currentUser, refreshDevboxList, fetchAccountAmount, fetchAuthInfo]);

  useEffect(() => {
    if (currentUser && (open || pinned)) {
      const currentRegionUrl = regionUrl || "bja.sealos.run";
      const cachedData = getCachedAccountAmount(currentRegionUrl);
      if (!cachedData || !isAccountDataValid(currentRegionUrl)) {
        console.log("🔄 Sidebar visible: Refreshing account data");
        debouncedFetchAccountAmount();
      }
    }
  }, [
    open,
    pinned,
    currentUser,
    regionUrl,
    getCachedAccountAmount,
    isAccountDataValid,
    debouncedFetchAccountAmount,
  ]);

  // Simplified content rendering using extracted section components
  const renderContent = () => {
    switch (currentPath) {
      case "/sidebar":
        return <MainSection navigationItems={navigationItems} handleNavigate={handleNavigate} />;
      case "/sidebar/dashboard":
        return <DashboardSection getAccountBalance={getAccountBalance} />;
      case "/sidebar/graph":
        return <GraphSection />;
      case "/sidebar/devbox":
        return <DevboxSection loading={devboxLoading} error={devboxError} data={devboxData} />;
      case "/sidebar/database":
        return <DatabaseSection />;
      case "/sidebar/ai-proxy":
        return <AIProxySection />;
      default:
        return <MainSection navigationItems={navigationItems} handleNavigate={handleNavigate} />;
    }
  };

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
                {currentPath !== "/sidebar" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackClick}
                    aria-label="Go back"
                    className="h-8 w-8"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <div className="flex items-center space-x-2">
                  <span className="pl-2 text-sm font-medium">
                    {getCurrentTitle()}
                  </span>
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
          <SidebarContent>{renderContent()}</SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SpotlightCard className="p-2 mb-2 rounded-lg h-10">
                  <div className="text-sm text-[var(--paragraph-text)] flex items-center justify-center h-full">
                    <span className="font-semibold text-[var(--heading-text)]">
                      Balance:
                    </span>{" "}
                    <span className="text-foreground ml-1">
                      {getAccountBalance()}
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
