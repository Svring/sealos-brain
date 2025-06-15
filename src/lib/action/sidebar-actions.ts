import { useCopilotAction } from "@copilotkit/react-core";
import { useControlStore } from "@/store/control-store";
import type {
  SidebarPath,
  SidebarVisibilityStatus,
} from "@/store/control/sidebar-slice";

/**
 * Sidebar Control Actions for AI
 * These actions allow the AI to control and query sidebar state
 */

export function useSidebarVisibilityActions() {
  const {
    sidebar,
    setSidebarVisibility,
    toggleSidebarPin,
    setSidebarOpen,
    enterSidebarHotZone,
  } = useControlStore();

  useCopilotAction({
    name: "setSidebarVisibility",
    description: "Set the sidebar visibility status (closed, open, or pinned)",
    available: "remote",
    parameters: [
      {
        name: "status",
        type: "string",
        description: "Visibility status: 'closed', 'open', or 'pinned'",
        required: true,
      },
    ],
    handler: async ({ status }) => {
      try {
        if (!["closed", "open", "pinned"].includes(status)) {
          return `Invalid status "${status}". Must be one of: closed, open, pinned`;
        }

        setSidebarVisibility(status as SidebarVisibilityStatus);
        return `Successfully set sidebar visibility to "${status}"`;
      } catch (error: any) {
        console.error("Failed to set sidebar visibility:", error);
        return `Failed to set sidebar visibility: ${error.message}`;
      }
    },
  });

  useCopilotAction({
    name: "toggleSidebarPin",
    description: "Toggle the sidebar pin state (pinned/unpinned)",
    available: "remote",
    parameters: [],
    handler: async () => {
      try {
        const wasPinned = sidebar.visibility.pinned;
        toggleSidebarPin();
        const newState = wasPinned ? "unpinned" : "pinned";
        return `Successfully ${newState} the sidebar`;
      } catch (error: any) {
        console.error("Failed to toggle sidebar pin:", error);
        return `Failed to toggle sidebar pin: ${error.message}`;
      }
    },
  });

  useCopilotAction({
    name: "openSidebar",
    description: "Open the sidebar",
    available: "remote",
    parameters: [],
    handler: async () => {
      try {
        setSidebarOpen(true);
        return "Successfully opened the sidebar";
      } catch (error: any) {
        console.error("Failed to open sidebar:", error);
        return `Failed to open sidebar: ${error.message}`;
      }
    },
  });

  useCopilotAction({
    name: "closeSidebar",
    description: "Close the sidebar",
    available: "remote",
    parameters: [],
    handler: async () => {
      try {
        setSidebarOpen(false);
        return "Successfully closed the sidebar";
      } catch (error: any) {
        console.error("Failed to close sidebar:", error);
        return `Failed to close sidebar: ${error.message}`;
      }
    },
  });
}

export function useSidebarNavigationActions() {
  const { sidebar, navigateToSidebarPath, goBackInSidebar } = useControlStore();

  useCopilotAction({
    name: "navigateToSidebarSection",
    description: "Navigate to a specific section in the sidebar",
    available: "remote",
    parameters: [
      {
        name: "section",
        type: "string",
        description:
          "Section to navigate to: 'dashboard', 'graph', 'devbox', 'database', 'ai-proxy', or 'main'",
        required: true,
      },
    ],
    handler: async ({ section }) => {
      try {
        let path: SidebarPath;

        switch (section.toLowerCase()) {
          case "main":
          case "home":
            path = "/sidebar";
            break;
          case "dashboard":
            path = "/sidebar/dashboard";
            break;
          case "graph":
            path = "/sidebar/graph";
            break;
          case "devbox":
            path = "/sidebar/devbox";
            break;
          case "database":
            path = "/sidebar/database";
            break;
          case "ai-proxy":
          case "aiproxy":
            path = "/sidebar/ai-proxy";
            break;
          default:
            return `Invalid section "${section}". Available sections: main, dashboard, graph, devbox, database, ai-proxy`;
        }

        navigateToSidebarPath(path);
        return `Successfully navigated to ${section} section`;
      } catch (error: any) {
        console.error("Failed to navigate sidebar:", error);
        return `Failed to navigate to ${section}: ${error.message}`;
      }
    },
  });

  useCopilotAction({
    name: "goBackInSidebar",
    description: "Go back to the previous section in the sidebar",
    available: "remote",
    parameters: [],
    handler: async () => {
      try {
        if (sidebar.navigation.history.length <= 1) {
          return "Cannot go back - already at the first page";
        }

        goBackInSidebar();
        return "Successfully navigated back in sidebar";
      } catch (error: any) {
        console.error("Failed to go back in sidebar:", error);
        return `Failed to go back: ${error.message}`;
      }
    },
  });
}

export function useSidebarQueryActions() {
  const { sidebar } = useControlStore();

  useCopilotAction({
    name: "getSidebarState",
    description:
      "Get the current state of the sidebar including visibility, navigation, and settings",
    available: "remote",
    parameters: [],
    handler: async () => {
      try {
        return {
          visibility: {
            status: sidebar.visibility.status,
            open: sidebar.visibility.open,
            pinned: sidebar.visibility.pinned,
          },
          navigation: {
            currentPath: sidebar.navigation.currentPath,
            currentSection:
              sidebar.navigation.currentPath.replace("/sidebar", "") || "main",
            canGoBack: sidebar.navigation.history.length > 1,
            history: sidebar.navigation.history,
          },
          resize: {
            width: sidebar.resize.width,
            minWidth: sidebar.resize.minWidth,
            isResizing: sidebar.resize.isResizing,
          },
          dataFetch: {
            hasInitialFetch: sidebar.dataFetch.hasInitialFetch,
            lastFetchTimestamp: sidebar.dataFetch.lastFetchTimestamp,
          },
          settings: sidebar.settings,
        };
      } catch (error: any) {
        console.error("Failed to get sidebar state:", error);
        return `Failed to get sidebar state: ${error.message}`;
      }
    },
  });

  useCopilotAction({
    name: "getSidebarCurrentSection",
    description: "Get the currently active section in the sidebar",
    available: "remote",
    parameters: [],
    handler: async () => {
      try {
        const currentPath = sidebar.navigation.currentPath;
        const section =
          currentPath === "/sidebar"
            ? "main"
            : currentPath.replace("/sidebar/", "");

        return {
          currentSection: section,
          currentPath: currentPath,
          canGoBack: sidebar.navigation.history.length > 1,
        };
      } catch (error: any) {
        console.error("Failed to get current sidebar section:", error);
        return `Failed to get current section: ${error.message}`;
      }
    },
  });
}

export function useSidebarSettingsActions() {
  const { sidebar, updateSidebarSettings, setSidebarWidth } = useControlStore();

  useCopilotAction({
    name: "setSidebarWidth",
    description: "Set the width of the sidebar",
    available: "remote",
    parameters: [
      {
        name: "width",
        type: "number",
        description: "Width in pixels (minimum 180px)",
        required: true,
      },
    ],
    handler: async ({ width }) => {
      try {
        if (width < sidebar.resize.minWidth) {
          return `Width must be at least ${sidebar.resize.minWidth}px`;
        }

        setSidebarWidth(width);
        return `Successfully set sidebar width to ${width}px`;
      } catch (error: any) {
        console.error("Failed to set sidebar width:", error);
        return `Failed to set sidebar width: ${error.message}`;
      }
    },
  });

  useCopilotAction({
    name: "updateSidebarSettings",
    description: "Update sidebar settings like close delay",
    available: "remote",
    parameters: [
      {
        name: "closeDelay",
        type: "number",
        description:
          "Delay in milliseconds before auto-closing when not pinned",
        required: false,
      },
    ],
    handler: async ({ closeDelay }) => {
      try {
        const updates: any = {};

        if (closeDelay !== undefined) {
          if (closeDelay < 0 || closeDelay > 5000) {
            return "Close delay must be between 0 and 5000 milliseconds";
          }
          updates.closeDelay = closeDelay;
        }

        if (Object.keys(updates).length === 0) {
          return "No settings to update";
        }

        updateSidebarSettings(updates);

        const updatedSettings = Object.keys(updates).join(", ");
        return `Successfully updated sidebar settings: ${updatedSettings}`;
      } catch (error: any) {
        console.error("Failed to update sidebar settings:", error);
        return `Failed to update sidebar settings: ${error.message}`;
      }
    },
  });
}

/**
 * Convenience hook to use all sidebar actions at once
 */
export function useSidebarActions() {
  useSidebarVisibilityActions();
  useSidebarNavigationActions();
  useSidebarQueryActions();
  useSidebarSettingsActions();
}
