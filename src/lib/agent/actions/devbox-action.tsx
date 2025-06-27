import { useCopilotAction } from "@copilotkit/react-core";
import { useQuery } from "@tanstack/react-query";
import {
  CreateDevboxActionUI,
  DeleteDevboxActionUI,
  GetDevboxListActionUI,
  ShutdownDevboxActionUI,
  StartDevboxActionUI,
} from "@/components/agent/devbox-action-ui";
import { DEVBOX_TEMPLATES } from "@/lib/sealos/devbox/devbox-constant";
import {
  createDevboxFromTemplateMutation,
  createMultipleDevboxes,
  deleteDevboxMutation,
  deleteMultipleDevboxes,
  shutdownDevboxMutation,
  shutdownMultipleDevboxes,
  startDevboxMutation,
  startMultipleDevboxes,
} from "@/lib/sealos/devbox/devbox-mutation";
import {
  validateDevboxNames,
  validateTemplates,
} from "@/lib/sealos/devbox/devbox-utils";
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
    handler: () => {
      return devboxList;
    },
    render: ({ status, result }) => {
      return <GetDevboxListActionUI result={result} status={status} />;
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
    description: "Start one or more devboxes by name",
    available: "remote",
    parameters: [
      {
        name: "devboxName",
        type: "string[]",
        description:
          "The name(s) of the devbox(es) to start. Can be a single devbox name or array of devbox names.",
        required: true,
      },
    ],
    handler: async ({ devboxName }) => {
      const devboxNames = Array.isArray(devboxName) ? devboxName : [devboxName];
      const isMultiple = Array.isArray(devboxName);

      // Validate devbox names
      const { isValid, invalidNames } = validateDevboxNames(devboxNames);
      if (!isValid) {
        return `Invalid devbox name(s): ${invalidNames.join(", ")}. Names must be non-empty and contain only lowercase letters, numbers, and hyphens.`;
      }

      try {
        if (isMultiple) {
          // Start multiple devboxes using bulk operation
          const { summary } = await startMultipleDevboxes(
            devboxNames.filter((n): n is string => Boolean(n)),
            currentUser,
            regionUrl
          );
          return summary;
        }
        // Start single devbox
        const result = await startDevbox(devboxNames[0] || "");
        return `Devbox '${result.devboxName || devboxNames[0]}' is successfully started`;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        return isMultiple
          ? `Failed to start devboxes: ${errorMessage}`
          : `Failed to start devbox '${devboxNames[0]}': ${errorMessage}`;
      }
    },
    render: ({ status, args, result }) => {
      const { devboxName } = args;
      return (
        <StartDevboxActionUI
          devboxName={devboxName || []}
          result={result}
          status={status}
        />
      );
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
    description: "Shutdown one or more devboxes by name",
    available: "remote",
    parameters: [
      {
        name: "devboxName",
        type: "string[]",
        description:
          "The name(s) of the devbox(es) to shutdown. Can be a single devbox name or array of devbox names.",
        required: true,
      },
    ],
    handler: async ({ devboxName }) => {
      const devboxNames = Array.isArray(devboxName) ? devboxName : [devboxName];
      const isMultiple = Array.isArray(devboxName);

      // Validate devbox names
      const { isValid, invalidNames } = validateDevboxNames(devboxNames);
      if (!isValid) {
        return `Invalid devbox name(s): ${invalidNames.join(", ")}. Names must be non-empty and contain only lowercase letters, numbers, and hyphens.`;
      }

      try {
        if (isMultiple) {
          // Shutdown multiple devboxes using bulk operation
          const { summary } = await shutdownMultipleDevboxes(
            devboxNames.filter((n): n is string => Boolean(n)),
            currentUser,
            regionUrl
          );
          return summary;
        }
        // Shutdown single devbox
        const result = await shutdownDevbox({
          devboxName: devboxNames[0] || "",
          shutdownMode: "Stopped",
        });
        const action =
          result.shutdownMode === "Stopped" ? "stopped" : "shutdown";
        return `Devbox '${result.devboxName || devboxNames[0]}' is successfully ${action}`;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        return isMultiple
          ? `Failed to shutdown devboxes: ${errorMessage}`
          : `Failed to shutdown devbox '${devboxNames[0]}': ${errorMessage}`;
      }
    },
    render: ({ status, args, result }) => {
      const { devboxName } = args;
      return (
        <ShutdownDevboxActionUI
          devboxName={devboxName || []}
          result={result}
          status={status}
        />
      );
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
    description: "Delete one or more devboxes by name",
    available: "enabled",
    parameters: [
      {
        name: "devboxName",
        type: "string[]",
        description:
          "The name(s) of the devbox(es) to delete. Can be a single devbox name or array of devbox names.",
        required: true,
      },
    ],
    renderAndWaitForResponse: ({ status, args, result, respond }) => {
      const { devboxName } = args;
      const devboxNames = Array.isArray(devboxName) ? devboxName : [devboxName];
      const isMultiple = Array.isArray(devboxName);

      // Validate devbox names
      const { isValid, invalidNames } = validateDevboxNames(devboxNames);
      if (!isValid) {
        respond?.(
          `Invalid devbox name(s): ${invalidNames.join(", ")}. Names must be non-empty and contain only lowercase letters, numbers, and hyphens.`
        );
        return (
          <div className="space-y-2">
            <h2 className="font-semibold text-lg text-red-600">
              Invalid Devbox Names
            </h2>
            <p>
              Invalid devbox name(s): <strong>{invalidNames.join(", ")}</strong>
            </p>
            <p className="text-gray-600 text-sm">
              Names must be non-empty and contain only lowercase letters,
              numbers, and hyphens.
            </p>
          </div>
        );
      }

      return (
        <DeleteDevboxActionUI
          devboxName={devboxName || []}
          onReject={() => {
            respond?.(
              isMultiple
                ? "User cancelled the deletion of multiple devboxes"
                : "User cancelled the devbox deletion operation"
            );
          }}
          onSelect={async () => {
            try {
              if (isMultiple) {
                // Delete multiple devboxes using bulk operation
                const { summary } = await deleteMultipleDevboxes(
                  devboxNames.filter((n): n is string => Boolean(n)),
                  currentUser,
                  regionUrl
                );
                respond?.(summary);
              } else {
                // Delete single devbox
                const deleteResult = await deleteDevbox(devboxNames[0] || "");
                respond?.(
                  `Devbox '${deleteResult.devboxName || devboxNames[0]}' is successfully deleted`
                );
              }
            } catch (error: unknown) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred";
              respond?.(
                isMultiple
                  ? `Failed to delete devboxes: ${errorMessage}`
                  : `Failed to delete devbox '${devboxNames[0]}': ${errorMessage}`
              );
            }
          }}
          result={result}
          status={status}
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
    description: "Create one or more devboxes from predefined templates",
    available: "enabled",
    parameters: [
      {
        name: "template",
        type: "string[]",
        description: `The name(s) of the template(s) to create devbox(es) from. Can be a single template or array of templates. Available templates: ${DEVBOX_TEMPLATES.join(", ")}.`,
        required: true,
      },
    ],
    renderAndWaitForResponse: ({ status, args, result, respond }) => {
      const { template } = args;
      const templates = Array.isArray(template) ? template : [template];

      // Validate that all templates are valid DEVBOX_TEMPLATES
      const { isValid, invalidTemplates } = validateTemplates(templates);
      if (!isValid) {
        respond?.(
          `Invalid template(s): ${invalidTemplates.join(", ")}. Available templates: ${DEVBOX_TEMPLATES.join(", ")}.`
        );
        return (
          <div className="space-y-2">
            <h2 className="font-semibold text-lg text-red-600">
              Invalid Templates
            </h2>
            <p>
              Invalid template(s):{" "}
              <strong>{invalidTemplates.join(", ")}</strong>
            </p>
            <p className="text-gray-600 text-sm">
              Available templates: {DEVBOX_TEMPLATES.join(", ")}
            </p>
          </div>
        );
      }

      const isMultiple = Array.isArray(template);

      return (
        <CreateDevboxActionUI
          onReject={() => {
            respond?.(
              isMultiple
                ? "User cancelled the creation of multiple devboxes"
                : "User wants to create a different devbox, please withdraw the current action and query the user again"
            );
          }}
          onSelect={async () => {
            try {
              if (isMultiple) {
                // Create multiple devboxes using bulk operation
                const { summary } = await createMultipleDevboxes(
                  templates.filter((t): t is string => Boolean(t)),
                  currentUser,
                  regionUrl
                );
                respond?.(summary);
              } else {
                // Create single devbox
                const createResult = await createDevbox(templates[0] || "");
                respond?.(
                  `Devbox '${createResult.devboxName}' is successfully created from template '${createResult.templateName || templates[0]}'`
                );
              }
            } catch (error: unknown) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred";
              respond?.(
                isMultiple
                  ? `Failed to create devboxes: ${errorMessage}`
                  : `Failed to create devbox from template '${templates[0]}': ${errorMessage}`
              );
            }
          }}
          result={result}
          status={status}
          template={template || []}
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
