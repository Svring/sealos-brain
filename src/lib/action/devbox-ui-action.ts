import { useCopilotAction } from "@copilotkit/react-core";
import { useControlStore } from "@/store/control-store";

/**
 * UI-specific Devbox Copilot Actions
 * These actions control the UI without depending on ReactFlow context
 */

export function useOpenDevboxCreatePanelAction() {
  const { openPanel } = useControlStore();

  useCopilotAction({
    name: "openDevboxCreatePanel",
    description:
      "Open the Devbox creation panel with optional pre-filled form data",
    available: "remote",
    parameters: [
      {
        name: "formData",
        type: "object",
        description: "Optional pre-filled form data",
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
      },
    ],
    handler: async ({ formData }) => {
      try {
        const nodeId = `devbox-${Date.now()}`;

        // Update control store with panel state and form data
        openPanel({
          type: "devbox-create",
          nodeId,
          formData: formData || {},
        });

        // The actual panel opening will be handled by the main page
        // which listens to control store changes

        return `Opened the Devbox creation panel${formData ? " with pre-filled data" : ""}. You can now configure and create a new devbox.`;
      } catch (error: any) {
        console.error("Failed to open devbox create panel:", error);
        return `Failed to open devbox creation panel: ${error.message}`;
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

export function useCloseDevboxPanelAction() {
  const { closePanel } = useControlStore();

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
  useOpenDevboxCreatePanelAction();
  useUpdateDevboxFormAction();
  useCloseDevboxPanelAction();
}
