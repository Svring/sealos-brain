import { useCopilotAction } from "@copilotkit/react-core";
import { useSealosStore } from "@/store/sealos-store";
import { useCreateGraphWithResourcesMutation } from "@/lib/graph/graph-mutation";
import { useGraphsQuery } from "@/lib/graph/graph-query";
import { type ResourceType } from "@/lib/sealos/k8s/k8s-constant";

export function getGraphListAction() {
  const { currentUser } = useSealosStore();
  const { data: allGraphs } = useGraphsQuery(currentUser);

  useCopilotAction({
    name: "getGraphList",
    description: "Get all graphs with their resources",
    handler: async () => {
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
  getGraphListAction();
  createGraphWithResourcesAction();
}
