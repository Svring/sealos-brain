"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Boxes,
  DollarSign,
  Drama,
  Home,
  PanelLeft,
  User2,
  Workflow,
} from "lucide-react";
// React and third-party imports
// UI Components
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  MainSection,
  type NavigationItem,
} from "@/components/ui/sidebar-section";
import { accountAmountOptions } from "@/lib/sealos/account/account-query";
// Utils
import { transformAccountAmountIntoBalance } from "@/lib/sealos/account/account-transform";
import { cn } from "@/lib/utils";
// Hooks and store
import { useSealosStore } from "@/store/sealos-store";

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
  },
  // {
  //   title: "Opera",
  //   icon: Drama,
  //   group: "overview",
  //   path: "/opera",
  // },
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

  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className={cn("bg-background")}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleSidebar}>
              <PanelLeft className="h-4 w-4" />
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
              <DollarSign className="h-4 w-4" />
              <span>{accountLoading ? "Loading..." : accountAmountData}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User2 className="h-4 w-4" />
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
