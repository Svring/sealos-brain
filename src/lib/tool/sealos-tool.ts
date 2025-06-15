import { useCopilotAction } from "@copilotkit/react-core";
import { useSealosDevbox } from "@/lib/devbox/devbox-query";
import { useDevboxUIActions } from "@/lib/action/devbox-ui-action";

type ShutdownModeType = "Stopped" | "Shutdown";

/**
 * Sealos Copilot Tools
 * Extracted tools for better organization and reusability
 */

export function useStartDevboxTool() {
  const { startDevbox } = useSealosDevbox();

  useCopilotAction({
    name: "startDevbox",
    description: "Start a specific devbox by name",
    available: "remote",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        description: "The name of the devbox to start",
        required: true,
      },
    ],
    handler: async ({ devboxName }) => {
      try {
        console.log(`Starting devbox: ${devboxName}`);
        const result = await startDevbox(devboxName);
        console.log(`Successfully started devbox: ${devboxName}`, result);
        return `Successfully started devbox "${devboxName}". The devbox is now starting up and will be available shortly.`;
      } catch (error: any) {
        console.error(`Failed to start devbox: ${devboxName}`, error);
        return `Failed to start devbox "${devboxName}": ${error.message}`;
      }
    },
  });
}

export function useShutdownDevboxTool() {
  const { shutdownDevbox } = useSealosDevbox();

  useCopilotAction({
    name: "shutdownDevbox",
    description:
      "Shutdown a specific devbox by name with optional shutdown mode",
    available: "remote",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        description: "The name of the devbox to shutdown",
        required: true,
      },
      {
        name: "shutdownMode",
        type: "string",
        description: "The shutdown mode: 'Stopped' (default) or 'Shutdown'",
        required: false,
      },
    ],
    handler: async ({ devboxName, shutdownMode }) => {
      try {
        const mode = (shutdownMode as ShutdownModeType) || "Stopped";
        console.log(`Shutting down devbox: ${devboxName} with mode: ${mode}`);
        const result = await shutdownDevbox(devboxName, mode);
        console.log(`Successfully shutdown devbox: ${devboxName}`, result);
        return `Successfully shutdown devbox "${devboxName}" with mode "${mode}". The devbox has been ${mode.toLowerCase()}.`;
      } catch (error: any) {
        console.error(`Failed to shutdown devbox: ${devboxName}`, error);
        return `Failed to shutdown devbox "${devboxName}": ${error.message}`;
      }
    },
  });
}

/**
 * Convenience hook to use all Sealos tools at once
 */
export function useSealosTools() {
  useStartDevboxTool();
  useShutdownDevboxTool();

  // Include UI actions for controlling the interface
  useDevboxUIActions();
}
