import React from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export type SidebarPath =
  | "/sidebar"
  | "/sidebar/dashboard"
  | "/sidebar/graph"
  | "/sidebar/devbox"
  | "/sidebar/database"
  | "/sidebar/ai-proxy";

// Types
export interface NavigationItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "overview" | "application";
}

export interface MainSectionProps {
  navigationItems: NavigationItem[];
}

export const MainSection: React.FC<MainSectionProps> = ({
  navigationItems,
}) => (
  <>
    <SidebarGroup>
      <SidebarGroupLabel>Overview</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems
            .filter((item) => item.group === "overview")
            .map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton>
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
    <SidebarGroup>
      <SidebarGroupLabel>Application</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems
            .filter((item) => item.group === "application")
            .map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton>
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </>
);

export const DashboardSection: React.FC<{
  getAccountBalance: () => string;
}> = ({ getAccountBalance }) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-4">Dashboard</h3>
    <div className="space-y-4">
      <SpotlightCard className="p-4 w-full">
        <h4 className="text-sm font-medium mb-2 text-[var(--heading-text)]">
          Account Balance
        </h4>
        <div className="text-2xl font-bold text-[var(--heading-text)]">
          ${getAccountBalance()}
        </div>
      </SpotlightCard>
    </div>
  </div>
);

export const GraphSection: React.FC = () => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-4">Graph</h3>
    <p className="text-sm text-muted-foreground">
      Graph visualization coming soon...
    </p>
  </div>
);

interface DevboxProps {
  loading: boolean;
  error: string | null;
  data: any;
}

export const DevboxSection: React.FC<DevboxProps> = ({
  loading,
  error,
  data,
}) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-4">DevBox</h3>
    {loading && (
      <div className="text-sm text-muted-foreground">
        Loading devbox list...
      </div>
    )}
    {error && <div className="text-sm text-red-500 mb-4">Error: {error}</div>}
    {data && (
      <div className="space-y-4">
        <div className="text-sm text-green-600">
          ✅ Devbox list loaded successfully!
        </div>
        <div className="bg-gray-100 p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2">API Response:</h4>
          <pre className="text-xs overflow-auto max-h-64">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    )}
    {!loading && !error && !data && (
      <p className="text-sm text-muted-foreground">
        Click to load devbox list or select a DevBox tool from the navigation
        menu.
      </p>
    )}
  </div>
);

export const DatabaseSection: React.FC = () => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-4">Database</h3>
    <p className="text-sm text-muted-foreground">
      Database management interface coming soon...
    </p>
  </div>
);

export const AIProxySection: React.FC = () => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-4">AI Proxy</h3>
    <p className="text-sm text-muted-foreground">
      AI Proxy configuration and management coming soon...
    </p>
  </div>
);
