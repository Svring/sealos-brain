import { useCopilotAction } from "@copilotkit/react-core";
import { useSidebarState } from "@/context/sidebar-state-provider";

/**
 * Simplified Sidebar Control Actions for AI
 * These actions allow the AI to control the basic sidebar open/close state
 */

export function useSidebarVisibilityActions() {
  const { open, setOpen, toggleOpen } = useSidebarState();

  useCopilotAction({
    name: "setSidebarVisibility",
    description: "Set the sidebar visibility (open or closed)",
    available: "remote",
    parameters: [
      {
        name: "visible",
        type: "boolean",
        description: "Whether the sidebar should be visible",
        required: true,
      },
    ],
    handler: async ({ visible }) => {
      try {
        setOpen(visible);
        return `Successfully ${visible ? "opened" : "closed"} the sidebar`;
      } catch (error: any) {
        console.error("Failed to set sidebar visibility:", error);
        return `Failed to set sidebar visibility: ${error.message}`;
      }
    },
  });

  useCopilotAction({
    name: "toggleSidebar",
    description: "Toggle the sidebar open/closed state",
    available: "remote",
    parameters: [],
    handler: async () => {
      try {
        const wasOpen = open;
        toggleOpen();
        const newState = wasOpen ? "closed" : "opened";
        return `Successfully ${newState} the sidebar`;
      } catch (error: any) {
        console.error("Failed to toggle sidebar:", error);
        return `Failed to toggle sidebar: ${error.message}`;
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
        setOpen(true);
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
        setOpen(false);
        return "Successfully closed the sidebar";
      } catch (error: any) {
        console.error("Failed to close sidebar:", error);
        return `Failed to close sidebar: ${error.message}`;
      }
    },
  });
}

export function useSidebarQueryActions() {
  const { open } = useSidebarState();

  useCopilotAction({
    name: "getSidebarState",
    description: "Get the current state of the sidebar",
    available: "remote",
    parameters: [],
    handler: async () => {
      try {
        return {
          open,
          visible: open,
          type: "simplified",
        };
      } catch (error: any) {
        console.error("Failed to get sidebar state:", error);
        return `Failed to get sidebar state: ${error.message}`;
      }
    },
  });
}

/**
 * Convenience hook to use all simplified sidebar actions at once
 */
export function useSidebarActions() {
  useSidebarVisibilityActions();
  useSidebarQueryActions();
}
