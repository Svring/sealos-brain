import { useCopilotAction } from "@copilotkit/react-core";
import { useQuery } from "@tanstack/react-query";
import {
  CreateDevboxActionUI,
  DeleteDevboxActionUI,
} from "@/components/agent/devbox-action-ui";
import { DEVBOX_TEMPLATES } from "@/lib/sealos/devbox/devbox-constant";
import {
  createDevboxFromTemplateMutation,
  deleteDevboxMutation,
  shutdownDevboxMutation,
  startDevboxMutation,
} from "@/lib/sealos/devbox/devbox-mutation";
import { directResourceListOptions } from "@/lib/sealos/k8s/k8s-query";
import { useSealosStore } from "@/store/sealos-store";

export function getDevboxListAction() {
  const { currentUser } = useSealosStore();

  const { data: devboxList } = useQuery(
    directResourceListOptions(currentUser, "devbox")
  );

  useCopilotAction({
    name: "getDevboxList",
    description: "Get the list of devboxes",
    handler: async () => {
      return devboxList;
    },
  });
}

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
      const result = await startDevbox(devboxName);
      return `Devbox '${result.devboxName || devboxName}' is successfully started`;
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
    ],
    handler: async ({ devboxName }) => {
      const result = await shutdownDevbox({
        devboxName,
        shutdownMode: "Stopped",
      });
      const action = result.shutdownMode === "Stopped" ? "stopped" : "shutdown";
      return `Devbox '${result.devboxName || devboxName}' is successfully ${action}`;
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
    available: "enabled",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        description: "The name of the devbox to delete",
        required: true,
      },
    ],
    renderAndWaitForResponse: ({ status, args, result, respond }) => {
      const { devboxName } = args;
      return (
        <DeleteDevboxActionUI
          devboxName={devboxName || ""}
          status={status}
          result={result}
          onSelect={async () => {
            const result = await deleteDevbox(devboxName || "");
            respond?.(
              `Devbox '${result.devboxName || devboxName}' is successfully deleted`
            );
          }}
          onReject={() => {
            respond?.("User cancelled the devbox deletion operation");
          }}
        />
      );
    },
  });
}

export function createDevboxAction() {
  const { currentUser, regionUrl } = useSealosStore();
  const { mutateAsync: createDevbox } = createDevboxFromTemplateMutation(
    currentUser,
    regionUrl
  );

  useCopilotAction({
    name: "createDevbox",
    description: "Create a new devbox",
    available: "enabled",
    parameters: [
      {
        name: "template",
        type: "string",
        description: "The name of the template to create",
        required: true,
        enum: DEVBOX_TEMPLATES,
      },
    ],
    renderAndWaitForResponse: ({ status, args, result, respond }) => {
      const { template } = args;
      return (
        <CreateDevboxActionUI
          template={template || ""}
          status={status}
          result={result}
          onSelect={async () => {
            const result = await createDevbox(template || "");
            respond?.(
              `Devbox '${result.devboxName}' is successfully created from template '${result.templateName || template}'`
            );
          }}
          onReject={() => {
            respond?.(
              "User wants to create a different devbox, please withdraw the current action and query the user again"
            );
          }}
        />
      );
    },
  });
}

export function useActivateDevboxActions() {
  getDevboxListAction();
  startDevboxAction();
  shutdownDevboxAction();
  deleteDevboxAction();
  createDevboxAction();
}
