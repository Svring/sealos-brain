"use client";

// React and third-party imports
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Boxes,
  DollarSign,
  Home,
  PanelLeft,
  User2,
  Workflow,
} from "lucide-react";

// UI Components
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from "@/components/ui/sidebar";
import { MainSection, NavigationItem } from "@/components/ui/sidebar-section";

// Hooks and store
import { useSealosStore } from "@/store/sealos-store";
import { useSidebar } from "@/components/ui/sidebar";
import { accountAmountOptions } from "@/lib/sealos/account/account-query";

// Utils
import { transformAccountAmountIntoBalance } from "@/lib/sealos/account/account-transform";
import { cn } from "@/lib/utils";

// Constants
const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "Home",
    icon: Home,
    group: "overview",
    path: "/home",
  },
  {
    title: "Inventory",
    icon: Boxes,
    group: "overview",
    path: "/inventory",
  },
  {
    title: "Graph",
    icon: Workflow,
    group: "overview",
    path: "/graph",
  }
];

// Main component
export default function AppSidebar() {
  // Store and hooks
  const { currentUser, regionUrl } = useSealosStore();

  const { data: accountAmountData, isLoading: accountLoading } = useQuery(
    accountAmountOptions(
      currentUser,
      regionUrl,
      transformAccountAmountIntoBalance
    )
  );

  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className={cn("bg-background")}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleSidebar}>
              <PanelLeft className="w-4 h-4" />
              <span>Sealos Brain</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className={cn("bg-background")}>
        <MainSection navigationItems={NAVIGATION_ITEMS} />
      </SidebarContent>
      <SidebarFooter className={cn("bg-background")}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <DollarSign className="w-4 h-4" />
              <span>
                {accountLoading ? "Loading..." : accountAmountData}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User2 className="w-4 h-4" />
              <span>
                {currentUser?.username || currentUser?.email || "User"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
