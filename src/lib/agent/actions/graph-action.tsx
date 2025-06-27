import { useCopilotAction } from "@copilotkit/react-core";
import { customAlphabet } from "nanoid";
import { useCreateGraphWithResourcesMutation } from "@/lib/graph/graph-mutation";
import { useGraphsQuery } from "@/lib/graph/graph-query";
import type { ResourceType } from "@/lib/sealos/k8s/k8s-constant";
import { useSealosStore } from "@/store/sealos-store";

// Create a custom nanoid with lowercase alphabet and numbers for 4 characters
const nanoid4 = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 4);

export function getGraphListAction() {
  const { currentUser } = useSealosStore();
  const { data: allGraphs } = useGraphsQuery(currentUser);

  useCopilotAction({
    name: "getGraphList",
    description: "Get all graphs with their resources",
    handler: () => {
      return {
        graphs: allGraphs || {},
        totalGraphs: Object.keys(allGraphs || {}).length,
        graphNames: Object.keys(allGraphs || {}),
      };
    },
  });
}

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

      // Add 4-length nanoid suffix to the graph name
      const uniqueGraphName = `${graphName}-${nanoid4()}`;

      const result = await createGraphWithResources({
        currentUser,
        graphName: uniqueGraphName,
        resources: resources as { [resourceType in ResourceType]?: string[] },
      });

      return result;
    },
  });
}

export function useActivateGraphActions() {
  getGraphListAction();
  createGraphWithResourcesAction();
}
