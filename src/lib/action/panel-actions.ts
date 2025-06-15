import { useCopilotAction } from "@copilotkit/react-core";
import { useControlStore } from "@/store/control-store";
import { PanelState, DevboxCreateFormData } from "@/store/control/panel-slice";

/**
 * Panel Copilot Actions
 * These actions allow the AI to control panel state and operations
 */

export function useOpenPanelAction() {
  const { openPanel } = useControlStore();

  useCopilotAction({
    name: "openPanel",
    description: "Open a specific panel with optional configuration",
    available: "remote",
    parameters: [
      {
        name: "panelType",
        type: "string",
        description:
          "Type of panel to open: 'devbox-create', 'devbox-detail', 'node-create', 'database-create', 'ai-proxy-create'",
        required: true,
      },
      {
        name: "nodeId",
        type: "string",
        description: "Optional node ID for panels that require it",
        required: false,
      },
      {
        name: "devboxName",
        type: "string",
        description: "Devbox name for devbox-detail panel",
        required: false,
      },
      {
        name: "formData",
        type: "object",
        description: "Optional pre-filled form data for devbox-create panel",
        required: false,
        properties: [
          {
            name: "name",
            type: "string",
            description: "Devbox name",
            required: false,
          },
          {
            name: "templateId",
            type: "string",
            description: "Template ID to use",
            required: false,
          },
          {
            name: "cpu",
            type: "number",
            description: "Number of CPU cores",
            required: false,
          },
          {
            name: "memory",
            type: "number",
            description: "Memory in GB",
            required: false,
          },
          {
            name: "disk",
            type: "number",
            description: "Disk size in GB",
            required: false,
          },
        ],
      },
    ],
    handler: async ({ panelType, nodeId, devboxName, formData }) => {
      try {
        let panel: PanelState;

        switch (panelType) {
          case "devbox-create":
            panel = {
              type: "devbox-create",
              nodeId: nodeId || `devbox-${Date.now()}`,
              formData: formData as DevboxCreateFormData,
            };
            break;
          case "devbox-detail":
            if (!devboxName) {
              return "Error: devboxName is required for devbox-detail panel";
            }
            panel = { type: "devbox-detail", devboxName };
            break;
          case "node-create":
            panel = { type: "node-create" };
            break;
          case "database-create":
            panel = { type: "database-create", nodeId };
            break;
          case "ai-proxy-create":
            panel = { type: "ai-proxy-create", nodeId };
            break;
          default:
            return `Error: Unknown panel type "${panelType}". Valid types are: devbox-create, devbox-detail, node-create, database-create, ai-proxy-create`;
        }

        openPanel(panel);
        return `Successfully opened ${panelType} panel${nodeId ? ` with node ID ${nodeId}` : ""}${devboxName ? ` for devbox ${devboxName}` : ""}`;
      } catch (error: any) {
        console.error("Failed to open panel:", error);
        return `Failed to open panel: ${error.message}`;
      }
    },
  });
}

export function useClosePanelAction() {
  const { closePanel } = useControlStore();

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

export function useSetViewportAction() {
  const { setViewport } = useControlStore();

  useCopilotAction({
    name: "setViewport",
    description: "Set the viewport position and zoom level",
    available: "remote",
    parameters: [
      {
        name: "x",
        type: "number",
        description: "X coordinate of the viewport",
        required: false,
      },
      {
        name: "y",
        type: "number",
        description: "Y coordinate of the viewport",
        required: false,
      },
      {
        name: "zoom",
        type: "number",
        description: "Zoom level (0.1 to 2.0)",
        required: false,
      },
    ],
    handler: async ({ x, y, zoom }) => {
      try {
        const updates: any = {};
        if (x !== undefined) updates.x = x;
        if (y !== undefined) updates.y = y;
        if (zoom !== undefined) {
          if (zoom < 0.1 || zoom > 2.0) {
            return "Error: Zoom level must be between 0.1 and 2.0";
          }
          updates.zoom = zoom;
        }

        if (Object.keys(updates).length === 0) {
          return "Error: At least one viewport parameter (x, y, zoom) must be provided";
        }

        setViewport(updates);
        return `Successfully updated viewport: ${Object.keys(updates).join(", ")}`;
      } catch (error: any) {
        console.error("Failed to set viewport:", error);
        return `Failed to set viewport: ${error.message}`;
      }
    },
  });
}

export function useGetPanelStateAction() {
  const { panel, panelData, viewport, panelActions } = useControlStore();

  useCopilotAction({
    name: "getPanelState",
    description: "Get the current state of panels and viewport",
    available: "remote",
    parameters: [],
    handler: async () => {
      try {
        return {
          currentPanel: panel,
          panelData: panelData,
          viewport: viewport,
          availableActions: Object.keys(panelActions),
          actionDescriptions: Object.values(panelActions).map((action) => ({
            name: action.name,
            description: action.description,
            parameters: action.parameters,
          })),
        };
      } catch (error: any) {
        console.error("Failed to get panel state:", error);
        return `Failed to get panel state: ${error.message}`;
      }
    },
  });
}

export function useUpdateDevboxFormAction() {
  const { updateDevboxCreateForm } = useControlStore();

  useCopilotAction({
    name: "updateDevboxForm",
    description: "Update the devbox creation form fields",
    available: "remote",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Devbox name (alphanumeric and hyphens only)",
        required: false,
      },
      {
        name: "templateId",
        type: "string",
        description: "Template ID to use",
        required: false,
      },
      {
        name: "cpu",
        type: "number",
        description: "Number of CPU cores (1-8)",
        required: false,
      },
      {
        name: "memory",
        type: "number",
        description: "Memory in GB (1-32)",
        required: false,
      },
      {
        name: "disk",
        type: "number",
        description: "Disk size in GB (10-500)",
        required: false,
      },
    ],
    handler: async (params) => {
      try {
        // Filter out undefined values and validate
        const updates: any = {};

        if (params.name !== undefined) {
          if (!/^[a-zA-Z0-9-]+$/.test(params.name)) {
            return "Invalid devbox name. Use only alphanumeric characters and hyphens.";
          }
          updates.name = params.name;
        }

        if (params.templateId !== undefined) {
          updates.templateId = params.templateId;
        }

        if (params.cpu !== undefined) {
          if (params.cpu < 1 || params.cpu > 8) {
            return "Invalid CPU value. Must be between 1 and 8.";
          }
          updates.cpu = params.cpu;
        }

        if (params.memory !== undefined) {
          if (params.memory < 1 || params.memory > 32) {
            return "Invalid memory value. Must be between 1 and 32 GB.";
          }
          updates.memory = params.memory;
        }

        if (params.disk !== undefined) {
          if (params.disk < 10 || params.disk > 500) {
            return "Invalid disk value. Must be between 10 and 500 GB.";
          }
          updates.disk = params.disk;
        }

        if (Object.keys(updates).length === 0) {
          return "No form fields to update. Please specify at least one field.";
        }

        updateDevboxCreateForm(updates);

        const updatedFields = Object.keys(updates).join(", ");
        return `Successfully updated devbox form fields: ${updatedFields}`;
      } catch (error: any) {
        console.error("Failed to update devbox form:", error);
        return `Failed to update devbox form: ${error.message}`;
      }
    },
  });
}

/**
 * Convenience hook to use all Panel actions at once
 */
export function usePanelActions() {
  useOpenPanelAction();
  useClosePanelAction();
  useSetViewportAction();
  useGetPanelStateAction();
  useUpdateDevboxFormAction();
}
