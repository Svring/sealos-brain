import { useCopilotAction } from "@copilotkit/react-core";
import { useSealosStore } from "@/store/sealos-store";
import { usePanel } from "@/components/providers/panel-provider";
import DevboxCreateView from "@/components/node/devbox/create/view/devbox-create-view";
import React from "react";
import {
  shutdownDevboxMutation,
  startDevboxMutation,
  deleteDevboxMutation,
  releaseDevboxMutation,
  deleteDevboxVersionMutation,
} from "@/lib/devbox/devbox-mutation";

type ShutdownModeType = "Stopped" | "Shutdown";

/**
 * Sealos Copilot Tools
 * Extracted tools for better organization and reusability
 */

export function startDevboxAction() {
  const { currentUser, regionUrl } = useSealosStore();

  const { mutateAsync: startDevbox } = startDevboxMutation(
    currentUser,
    regionUrl
  );

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
        return `Successfully started devbox \"${devboxName}\". The devbox is now starting up and will be available shortly.`;
      } catch (error: any) {
        console.error(`Failed to start devbox: ${devboxName}`, error);
        return `Failed to start devbox \"${devboxName}\": ${error.message}`;
      }
    },
  });
}

export function shutdownDevboxAction() {
  const { currentUser, regionUrl } = useSealosStore();

  const { mutateAsync: shutdownDevbox } = shutdownDevboxMutation(
    currentUser,
    regionUrl
  );

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
        const result = await shutdownDevbox({ devboxName, shutdownMode: mode });
        console.log(`Successfully shutdown devbox: ${devboxName}`, result);
        return `Successfully shutdown devbox \"${devboxName}\" with mode \"${mode}\". The devbox has been ${mode.toLowerCase()}.`;
      } catch (error: any) {
        console.error(`Failed to shutdown devbox: ${devboxName}`, error);
        return `Failed to shutdown devbox \"${devboxName}\": ${error.message}`;
      }
    },
  });
}

export function openDevboxCreatePanelAction() {
  const { openPanel } = usePanel();

  useCopilotAction({
    name: "openDevboxCreatePanel",
    description: "Open the devbox creation panel/form to create a new devbox",
    available: "remote",
    parameters: [],
    handler: async () => {
      try {
        console.log("Opening devbox create panel");
        openPanel(
          "devbox-create",
          React.createElement(DevboxCreateView, { onComplete: () => {} })
        );
        return "Successfully opened the devbox creation panel. You can now configure and create a new devbox.";
      } catch (error: any) {
        console.error("Failed to open devbox create panel:", error);
        return `Failed to open devbox create panel: ${error.message}`;
      }
    },
  });
}

export function deleteDevboxAction() {
  const { currentUser, regionUrl } = useSealosStore();
  const { mutateAsync: deleteDevbox } = deleteDevboxMutation(
    currentUser,
    regionUrl
  );

  useCopilotAction({
    name: "deleteDevbox",
    description: "Delete a specific devbox by name",
    available: "remote",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        description: "The name of the devbox to delete",
        required: true,
      },
    ],
    handler: async ({ devboxName }) => {
      try {
        console.log(`Deleting devbox: ${devboxName}`);
        await deleteDevbox(devboxName);
        return `Successfully deleted devbox \"${devboxName}\".`;
      } catch (error: any) {
        console.error(`Failed to delete devbox: ${devboxName}`, error);
        return `Failed to delete devbox \"${devboxName}\": ${error.message}`;
      }
    },
  });
}

export function releaseDevboxAction() {
  const { currentUser, regionUrl } = useSealosStore();
  const { mutateAsync: releaseDevbox } = releaseDevboxMutation(
    currentUser,
    regionUrl
  );

  useCopilotAction({
    name: "releaseDevbox",
    description: "Release a specific devbox by name (free resources, cleanup)",
    available: "remote",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        description: "The name of the devbox to release",
        required: true,
      },
      {
        name: "devboxUid",
        type: "string",
        description: "The UID of the devbox to release",
        required: true,
      },
      {
        name: "tag",
        type: "string",
        description: "The tag of the devbox to release",
        required: true,
      },
      {
        name: "releaseDes",
        type: "string",
        description: "Release description (can be empty)",
        required: false,
      },
    ],
    handler: async ({ devboxName, devboxUid, tag, releaseDes = "" }) => {
      try {
        console.log(
          `Releasing devbox: ${devboxName}, uid: ${devboxUid}, tag: ${tag}`
        );
        await releaseDevbox({ devboxName, devboxUid, tag, releaseDes });
        return `Successfully released devbox \"${devboxName}\".`;
      } catch (error: any) {
        console.error(`Failed to release devbox: ${devboxName}`, error);
        return `Failed to release devbox \"${devboxName}\": ${error.message}`;
      }
    },
  });
}

export function deleteDevboxVersionAction() {
  const { currentUser, regionUrl } = useSealosStore();
  const { mutateAsync: deleteDevboxVersion } = deleteDevboxVersionMutation(
    currentUser,
    regionUrl
  );

  useCopilotAction({
    name: "deleteDevboxVersion",
    description: "Delete a specific devbox version by version name",
    available: "remote",
    parameters: [
      {
        name: "versionName",
        type: "string",
        description: "The name of the devbox version to delete",
        required: true,
      },
    ],
    handler: async ({ versionName }) => {
      try {
        console.log(`Deleting devbox version: ${versionName}`);
        await deleteDevboxVersion(versionName);
        return `Successfully deleted devbox version \"${versionName}\".`;
      } catch (error: any) {
        console.error(`Failed to delete devbox version: ${versionName}`, error);
        return `Failed to delete devbox version \"${versionName}\": ${error.message}`;
      }
    },
  });
}

/**
 * Convenience hook to use all Sealos tools at once
 */
export function activateDevboxActions() {
  startDevboxAction();
  shutdownDevboxAction();
  openDevboxCreatePanelAction();
  deleteDevboxAction();
  releaseDevboxAction();
  deleteDevboxVersionAction();

  // Include UI actions for controlling the interface
  // useDevboxUIActions();
}
