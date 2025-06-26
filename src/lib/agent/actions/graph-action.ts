import {
  useCopilotAction,
  useCopilotAdditionalInstructions,
} from "@copilotkit/react-core";
import { useSealosStore } from "@/store/sealos-store";
import { useCreateGraphWithResourcesMutation } from "@/lib/graph/graph-mutation";
import { useGraphsQuery, useGraphQuery } from "@/lib/graph/graph-query";
import { type ResourceType } from "@/lib/sealos/k8s/k8s-constant";

export function getGraphsAction() {
  const { currentUser } = useSealosStore();
  const { data: allGraphs } = useGraphsQuery(currentUser);

  useCopilotAction({
    name: "getGraphs",
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

export function getGraphAction() {
  const { currentUser } = useSealosStore();

  useCopilotAction({
    name: "getGraph",
    description: "Get a specific graph and its resources by graph name",
    available: "remote",
    parameters: [
      {
        name: "graphName",
        type: "string",
        description: "The name of the graph to retrieve",
        required: true,
      },
    ],
    handler: async ({ graphName }) => {
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // Use the graph query hook data directly
      const { data: allGraphs } = useGraphsQuery(currentUser);
      const specificGraph = allGraphs?.[graphName];

      if (!specificGraph) {
        return {
          message: `Graph '${graphName}' not found`,
          availableGraphs: Object.keys(allGraphs || {}),
          graph: null,
        };
      }

      const totalResources = Object.values(specificGraph).reduce(
        (total, resources) =>
          total + (Array.isArray(resources) ? resources.length : 0),
        0
      );

      return {
        graphName,
        resources: specificGraph,
        totalResources,
        resourceTypes: Object.keys(specificGraph),
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
  getGraphsAction();
  getGraphAction();
  createGraphWithResourcesAction();
}
