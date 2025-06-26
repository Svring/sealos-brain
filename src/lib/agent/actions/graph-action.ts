import {
  useCopilotAction,
  useCopilotAdditionalInstructions,
} from "@copilotkit/react-core";
import { useSealosStore } from "@/store/sealos-store";
import { useCreateGraphWithResourcesMutation } from "@/lib/graph/graph-mutation";
import { type ResourceType } from "@/lib/sealos/k8s/k8s-constant";

export function createGraphWithResourcesAction() {
  const { currentUser } = useSealosStore();
  const { mutateAsync: createGraphWithResources } =
    useCreateGraphWithResourcesMutation();

  useCopilotAction({
    name: "createGraphWithResources",
    description:
      "Create a graph and add existing resources to it by their names",
    available: "remote",
    parameters: [
      {
        name: "graphName",
        type: "string",
        description: "The name of the graph to create",
        required: true,
      },
      {
        name: "resources",
        type: "object",
        description:
          "Object containing resource types as keys and arrays of resource names as values. Example: {devbox: ['devbox1', 'devbox2'], cluster: ['cluster1', 'cluster2'], objectstoragebucket: ['bucket1', 'bucket2']}",
        required: true,
        attributes: [
          {
            name: "devbox",
            type: "string[]",
          },
          {
            name: "cluster",
            type: "string[]",
          },
          {
            name: "objectstoragebucket",
            type: "string[]",
          },
        ],
      },
    ],
    handler: async ({ graphName, resources }) => {
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      const result = await createGraphWithResources({
        currentUser,
        graphName,
        resources: resources as { [resourceType in ResourceType]?: string[] },
      });

      return result;
    },
  });
}

export function activateGraphActions() {
  useCopilotAdditionalInstructions({
    available: "enabled",
    instructions:
      "You can create a graph with existing resources by their names. The resources are devbox, cluster, and objectstoragebucket. you have to provide an object containing the resource type as the key and the resource name as the value. Example: {devbox: ['devbox1'], cluster: ['cluster1'], objectstoragebucket: ['bucket1']}",
  });

  createGraphWithResourcesAction();
}
