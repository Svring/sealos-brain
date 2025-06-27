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
  createMultipleDevboxes,
  deleteMultipleDevboxes,
  shutdownMultipleDevboxes,
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

      // Validate devbox names
      const { isValid, invalidNames } = validateDevboxNames(devboxNames);
      if (!isValid) {
        return `Invalid devbox name(s): ${invalidNames.join(", ")}. Names must be non-empty and contain only lowercase letters, numbers, and hyphens.`;
      }

      try {
        const { summary } = await startMultipleDevboxes(
          devboxNames.filter((n): n is string => Boolean(n)),
          currentUser,
          regionUrl
        );
        return summary;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        return `Failed to start devboxes: ${errorMessage}`;
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

      // Validate devbox names
      const { isValid, invalidNames } = validateDevboxNames(devboxNames);
      if (!isValid) {
        return `Invalid devbox name(s): ${invalidNames.join(", ")}. Names must be non-empty and contain only lowercase letters, numbers, and hyphens.`;
      }

      try {
        const { summary } = await shutdownMultipleDevboxes(
          devboxNames.filter((n): n is string => Boolean(n)),
          currentUser,
          regionUrl
        );
        return summary;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        return `Failed to shutdown devboxes: ${errorMessage}`;
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
            respond?.("User cancelled the devbox deletion operation");
          }}
          onSelect={async () => {
            try {
              const { summary } = await deleteMultipleDevboxes(
                devboxNames.filter((n): n is string => Boolean(n)),
                currentUser,
                regionUrl
              );
              respond?.(summary);
            } catch (error: unknown) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred";
              respond?.(`Failed to delete devboxes: ${errorMessage}`);
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

      return (
        <CreateDevboxActionUI
          onReject={() => {
            respond?.("User cancelled the devbox creation operation");
          }}
          onSelect={async () => {
            try {
              const { summary } = await createMultipleDevboxes(
                templates.filter((t): t is string => Boolean(t)),
                currentUser,
                regionUrl
              );
              respond?.(summary);
            } catch (error: unknown) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred";
              respond?.(`Failed to create devboxes: ${errorMessage}`);
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
