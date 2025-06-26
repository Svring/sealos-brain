import { useCopilotAction } from "@copilotkit/react-core";
import { useSealosStore } from "@/store/sealos-store";
import { useQuery } from "@tanstack/react-query";
import { directResourceListOptions } from "@/lib/sealos/k8s/k8s-query";
import {
  startDevboxMutation,
  shutdownDevboxMutation,
  deleteDevboxMutation,
  createDevboxFromTemplateMutation,
} from "@/lib/sealos/devbox/devbox-mutation";
import { DEVBOX_TEMPLATES } from "@/lib/sealos/devbox/devbox-constant";

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
      await startDevbox(devboxName);
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
      await shutdownDevbox({ devboxName, shutdownMode: "Stopped" });
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
      await deleteDevbox(devboxName);
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
    available: "remote",
    parameters: [
      {
        name: "template",
        type: "string",
        description: "The name of the template to create",
        required: true,
        enum: DEVBOX_TEMPLATES,
      },
    ],
    handler: async ({ template }) => {
      await createDevbox(template);
    },
  });
}

export function activateDevboxActions() {
  getDevboxListAction();
  startDevboxAction();
  shutdownDevboxAction();
  deleteDevboxAction();
  createDevboxAction();
}
