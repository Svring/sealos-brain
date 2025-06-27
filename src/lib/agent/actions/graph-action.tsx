import { useCopilotAction } from "@copilotkit/react-core";
import {
  CreateGraphWithNewResourcesActionUI,
  CreateGraphWithResourcesActionUI,
  GetGraphListActionUI,
} from "@/components/agent/graph-action-ui";
import {
  useAddResourceToGraphMutation,
  useCreateGraphWithResourcesMutation,
} from "@/lib/graph/graph-mutation";
import { useGraphsQuery } from "@/lib/graph/graph-query";
import {
  createGraphWithNewResources,
  type GraphCreationRequest,
  generateUniqueGraphName,
  validateGraphCreationRequest,
} from "@/lib/graph/graph-utils";
import { DB_TYPE_VERSION_MAP } from "@/lib/sealos/dbprovider/dbprovider-constant";
import { DEVBOX_TEMPLATES } from "@/lib/sealos/devbox/devbox-constant";
import type { ResourceType } from "@/lib/sealos/k8s/k8s-constant";
import { useSealosStore } from "@/store/sealos-store";

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

      const uniqueGraphName = generateUniqueGraphName(graphName);

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

export function createGraphWithNewResourcesAction() {
  const { currentUser, regionUrl } = useSealosStore();
  const { mutateAsync: addResourceToGraph } = useAddResourceToGraphMutation();

  // Only allow dbTypes with non-empty versions
  const allowedDbTypes = Object.entries(DB_TYPE_VERSION_MAP)
    .filter(([_, versions]) => Array.isArray(versions) && versions.length > 0)
    .map(([dbType]) => dbType);

  useCopilotAction({
    name: "createGraphWithNewResources",
    description: `Create a graph and generate new resources to add to it. You can create devboxes from templates, database clusters from types, and object storage buckets. Available devbox templates: ${DEVBOX_TEMPLATES.join(", ")}. Available database types: ${allowedDbTypes.join(", ")}.`,
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
        description: `Object specifying resources to create. Available devbox templates: ${DEVBOX_TEMPLATES.join(", ")}. Available database types: ${allowedDbTypes.join(", ")}. Example: {devbox: ['Node.js', 'Python'], cluster: ['postgresql', 'mongodb'], objectstoragebucket: {count: 2}}`,
        required: true,
        attributes: [
          {
            name: "devbox",
            type: "string[]",
            description: `Array of devbox template names to create. Available templates: ${DEVBOX_TEMPLATES.join(", ")}`,
          },
          {
            name: "cluster",
            type: "string[]",
            description: `Array of database types to create. Available types: ${allowedDbTypes.join(", ")}`,
          },
          {
            name: "objectstoragebucket",
            type: "object",
            attributes: [
              {
                name: "count",
                type: "number",
                description: "Number of object storage buckets to create",
              },
            ],
          },
        ],
      },
    ],
    renderAndWaitForResponse: ({ status, args, result, respond }) => {
      const { graphName, resources } = args;

      // Validate the request
      const validation = validateGraphCreationRequest({ graphName, resources });
      if (!validation.isValid) {
        const errorMessage = validation.errors.join(", ");
        respond?.(errorMessage);
        return (
          <div className="space-y-2">
            <h2 className="font-semibold text-lg text-red-600">
              Invalid Parameters
            </h2>
            <p>{errorMessage}</p>
          </div>
        );
      }

      const uniqueGraphName = generateUniqueGraphName(graphName as string);
      const request: GraphCreationRequest = {
        graphName: uniqueGraphName,
        resources: resources as GraphCreationRequest["resources"],
      };

      return (
        <CreateGraphWithNewResourcesActionUI
          graphName={uniqueGraphName}
          onReject={() => {
            respond?.("User cancelled the graph creation operation");
          }}
          onSelect={async () => {
            try {
              const createResult = await createGraphWithNewResources(
                request,
                currentUser,
                regionUrl,
                addResourceToGraph
              );

              respond?.(createResult.summary);
            } catch (error: unknown) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred";
              respond?.(
                `Failed to create graph with new resources: ${errorMessage}`
              );
            }
          }}
          resources={request.resources}
          result={result}
          status={status}
        />
      );
    },
  });
}

export function useActivateGraphActions() {
  getGraphListAction();
  // createGraphWithResourcesAction();
  createGraphWithNewResourcesAction();
}
