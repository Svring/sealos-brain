import { useCopilotAction } from "@copilotkit/react-core";
import { usePanel } from "@/context/panel-provider";

/**
 * UI-specific Devbox Copilot Actions
 * These actions control the UI without depending on ReactFlow context
 */

export function useCloseDevboxPanelAction() {
  const { closePanel } = usePanel();

  useCopilotAction({
    name: "closeDevboxPanel",
    description: "Close the currently open devbox panel",
    available: "remote",
    parameters: [],
    handler: async () => {
      try {
        closePanel();
        return "Successfully closed the devbox panel.";
      } catch (error: any) {
        console.error("Failed to close devbox panel:", error);
        return `Failed to close devbox panel: ${error.message}`;
      }
    },
  });
}

/**
 * Convenience hook to use all UI Devbox actions at once
 */
export function useDevboxUIActions() {
  useCloseDevboxPanelAction();
}
