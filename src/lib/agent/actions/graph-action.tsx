import { useCopilotAction } from "@copilotkit/react-core";
import { customAlphabet } from "nanoid";
import {
  CreateGraphWithResourcesActionUI,
  GetGraphListActionUI,
} from "@/components/agent/graph-action-ui";
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
    render: ({ status, result }) => {
      return <GetGraphListActionUI result={result} status={status} />;
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
    available: "enabled",
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
    renderAndWaitForResponse: ({ status, args, result, respond }) => {
      const { graphName, resources } = args;

      if (!(graphName && resources)) {
        respond?.("Missing required parameters: graphName and resources");
        return (
          <div className="space-y-2">
            <h2 className="font-semibold text-lg text-red-600">
              Invalid Parameters
            </h2>
            <p>Missing required parameters: graphName and resources</p>
          </div>
        );
      }

      // Add 4-length nanoid suffix to the graph name
      const uniqueGraphName = `${graphName}-${nanoid4()}`;

      return (
        <CreateGraphWithResourcesActionUI
          graphName={uniqueGraphName}
          onReject={() => {
            respond?.("User cancelled the graph creation operation");
          }}
          onSelect={async () => {
            try {
              if (!currentUser) {
                throw new Error("User not authenticated");
              }

              const createResult = await createGraphWithResources({
                currentUser,
                graphName: uniqueGraphName,
                resources: resources as {
                  [resourceType in ResourceType]?: string[];
                },
              });

              respond?.(
                `Graph '${createResult.graphName}' created successfully with ${createResult.resourcesAdded} resources added`
              );
            } catch (error: unknown) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred";
              respond?.(`Failed to create graph: ${errorMessage}`);
            }
          }}
          resources={resources as Record<string, string[]>}
          result={result}
          status={status}
        />
      );
    },
  });
}

export function useActivateGraphActions() {
  getGraphListAction();
  createGraphWithResourcesAction();
}
