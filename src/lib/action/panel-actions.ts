import { useCopilotAction } from "@copilotkit/react-core";
import { usePanel } from "@/context/panel-provider";

/**
 * Panel Copilot Actions
 * These actions allow the AI to control panel state and operations
 */

export function useClosePanelAction() {
  const { closePanel } = usePanel();

  useCopilotAction({
    name: "closePanel",
    description: "Close the currently open panel",
    available: "remote",
    parameters: [],
    handler: async () => {
      try {
        closePanel();
        return "Successfully closed the panel";
      } catch (error: any) {
        console.error("Failed to close panel:", error);
        return `Failed to close panel: ${error.message}`;
      }
    },
  });
}

/**
 * Convenience hook to use all panel actions at once
 */
export function usePanelActions() {
  useClosePanelAction();
}
