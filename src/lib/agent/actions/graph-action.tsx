import { useCopilotAction } from "@copilotkit/react-core";
import {
  CreateGraphWithNewResourcesActionUI,
  CreateGraphWithResourcesActionUI,
  DeleteDevboxesActionUI,
  GetGraphListActionUI,
} from "@/components/agent/graph-action-ui";
import { useCreateGraphWithResourcesMutation } from "@/lib/graph/graph-mutation";
import { useGraphQuery, useGraphsQuery } from "@/lib/graph/graph-query";
import {
  deleteClustersFromGraph,
  deleteDevboxesFromGraph,
  generateUniqueGraphName,
} from "@/lib/graph/graph-utils";
import { DB_TYPE_VERSION_MAP } from "@/lib/sealos/dbprovider/dbprovider-constant";
import { validateDBNames } from "@/lib/sealos/dbprovider/dbprovider-utils";
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

export function getCurrentGraphAction() {
  const { currentUser, currentGraphName } = useSealosStore();
  const { data: currentGraph, isLoading } = useGraphQuery(
    currentUser,
    currentGraphName || ""
  );

  useCopilotAction({
    name: "getCurrentGraph",
    description: "Get the current graph's resources and details",
    handler: () => {
      if (!currentGraphName) {
        return {
          error: "No current graph selected",
          currentGraphName: null,
          resources: {},
          totalResources: 0,
        };
      }

      if (isLoading) {
        return {
          currentGraphName,
          resources: {},
          totalResources: 0,
          loading: true,
        };
      }

      const totalResources = Object.values(currentGraph || {}).reduce(
        (acc, resourceList) =>
          acc + (Array.isArray(resourceList) ? resourceList.length : 0),
        0
      );

      return {
        currentGraphName,
        resources: currentGraph || {},
        totalResources,
        resourceTypes: Object.keys(currentGraph || {}),
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
      const resourcesObj = resources as Record<string, string[]>;

      // Calculate total resources
      const totalResources = Object.values(resourcesObj).reduce(
        (acc, names) => acc + (Array.isArray(names) ? names.length : 0),
        0
      );

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
                resources: resourcesObj as {
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
          resources={resourcesObj}
          result={result}
          status={status}
          totalResources={totalResources}
        />
      );
    },
  });
}

export function createGraphWithNewResourcesAction() {
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
      if (!(args && args.graphName && args.resources)) {
        return (
          <div className="flex min-h-[120px] items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-green-600 border-b-2" />
            <span className="ml-2 text-foreground/60 text-sm">
              Waiting for input...
            </span>
          </div>
        );
      }
      return (
        <CreateGraphWithNewResourcesActionUI
          args={args}
          respond={respond}
          result={result}
          status={status}
        />
      );
    },
  });
}

export function deleteClustersFromGraphAction() {
  const { currentUser, regionUrl } = useSealosStore();

  useCopilotAction({
    name: "deleteClustersFromGraph",
    description:
      "Delete one or more database clusters by name from the current graph",
    available: "remote",
    parameters: [
      {
        name: "clusterNames",
        type: "string[]",
        description:
          "The name(s) of the database cluster(s) to delete. Can be a single cluster name or array of cluster names.",
        required: true,
      },
    ],
    renderAndWaitForResponse: ({ status, args, result, respond }) => {
      const { clusterNames } = args;
      const clusterNamesArray = Array.isArray(clusterNames)
        ? clusterNames
        : [clusterNames];
      const validClusterNames = clusterNamesArray.filter(
        (name): name is string =>
          typeof name === "string" && name.trim().length > 0
      );

      // Validate cluster names
      const { isValid, invalidNames } = validateDBNames(validClusterNames);
      if (!isValid) {
        respond?.(
          `Invalid cluster name(s): ${invalidNames.join(", ")}. Names must be non-empty and contain only lowercase letters, numbers, and hyphens.`
        );
        return (
          <div className="space-y-2">
            <h2 className="font-semibold text-lg text-red-600">
              Invalid Cluster Names
            </h2>
            <p>
              Invalid cluster name(s):{" "}
              <strong>{invalidNames.join(", ")}</strong>
            </p>
            <p className="text-gray-600 text-sm">
              Names must be non-empty and contain only lowercase letters,
              numbers, and hyphens.
            </p>
          </div>
        );
      }

      // Create a simple UI component inline since we don't have the external one yet
      const isMultiple = validClusterNames.length > 1;

      if (status === "complete" && result) {
        return <div className="space-y-2">{result as string}</div>;
      }

      if (status === "executing" || status === "inProgress") {
        return (
          <div className="space-y-2">
            <h2 className="font-semibold text-lg text-red-600">
              {isMultiple ? "Deleting Clusters..." : "Deleting Cluster..."}
            </h2>
            {isMultiple ? (
              <div>
                <p>Deleting {validClusterNames.length} clusters:</p>
                <ul className="mt-2 space-y-1">
                  {validClusterNames.map((name) => (
                    <li className="flex items-center text-sm" key={name}>
                      <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                      <strong>{name}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>
                Deleting cluster '<strong>{validClusterNames[0]}</strong>'
              </p>
            )}
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-red-600 border-b-2" />
              <span className="text-gray-600 text-sm">Please wait...</span>
            </div>
          </div>
        );
      }

      // Initial confirmation UI
      return (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg text-red-600">
            {isMultiple
              ? "Multiple Clusters Deletion Confirmation"
              : "Cluster Deletion Confirmation"}
          </h2>
          <div className="rounded-lg border border-red-200 bg-background p-4">
            {isMultiple ? (
              <div>
                <p className="text-red-800">
                  <strong>Warning:</strong> Are you sure you want to delete{" "}
                  <strong>{validClusterNames.length} database clusters</strong>?
                </p>
                <ul className="mt-2 space-y-1">
                  {validClusterNames.map((name) => (
                    <li className="flex items-center" key={name}>
                      <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                      <strong>{name}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-red-800">
                <strong>Warning:</strong> Are you sure you want to delete
                cluster '<strong>{validClusterNames[0]}</strong>'?
              </p>
            )}
            <p className="mt-2 text-red-600 text-sm">
              This action cannot be undone and will permanently remove all data
              associated with {isMultiple ? "these clusters" : "this cluster"}.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              onClick={async () => {
                try {
                  if (!(currentUser && regionUrl)) {
                    throw new Error(
                      "User not authenticated or region URL missing"
                    );
                  }

                  const result = await deleteClustersFromGraph(
                    validClusterNames,
                    currentUser,
                    regionUrl
                  );
                  respond?.(result.summary);
                } catch (error: unknown) {
                  const errorMessage =
                    error instanceof Error
                      ? error.message
                      : "Unknown error occurred";
                  respond?.(`Failed to delete clusters: ${errorMessage}`);
                }
              }}
            >
              {isMultiple
                ? `Delete ${validClusterNames.length} Clusters`
                : "Delete Cluster"}
            </button>
            <button
              className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
              onClick={() => {
                respond?.("User cancelled the cluster deletion operation");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      );
    },
  });
}

export function deleteDevboxesFromGraphAction() {
  useCopilotAction({
    name: "deleteDevboxesFromGraph",
    description: "Delete one or more devboxes by name from the current graph",
    available: "remote",
    parameters: [
      {
        name: "devboxNames",
        type: "string[]",
        description:
          "The name(s) of the devbox(es) to delete. Can be a single devbox name or array of devbox names.",
        required: true,
      },
    ],
    renderAndWaitForResponse: ({ status, args, result, respond }) => {
      return (
        <DeleteDevboxesActionUI
          args={args}
          respond={respond}
          result={result}
          status={status}
        />
      );
    },
  });
}

export function useActivateGraphActions() {
  getGraphListAction();
  getCurrentGraphAction();
  createGraphWithResourcesAction();
  createGraphWithNewResourcesAction();
  // deleteClustersFromGraphAction();
  // deleteDevboxesFromGraphAction();
}
