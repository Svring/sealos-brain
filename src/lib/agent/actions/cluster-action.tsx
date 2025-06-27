import { useCopilotAction } from "@copilotkit/react-core";
import { useQuery } from "@tanstack/react-query";
import {
  CreateClusterActionUI,
  DeleteClusterActionUI,
  GetClusterListActionUI,
  PauseClusterActionUI,
  StartClusterActionUI,
} from "@/components/agent/cluster-action-ui";
import { DB_TYPE_VERSION_MAP } from "@/lib/sealos/dbprovider/dbprovider-constant";
import {
  createMultipleDBs,
  deleteMultipleDBs,
  pauseMultipleDBs,
  startMultipleDBs,
} from "@/lib/sealos/dbprovider/dbprovider-mutation";
import { dbProviderListOptions } from "@/lib/sealos/dbprovider/dbprovider-query";
import {
  generateDBFormFromType,
  validateDBNames,
  validateDBTypes,
} from "@/lib/sealos/dbprovider/dbprovider-utils";
import { useSealosStore } from "@/store/sealos-store";

export function getClusterListAction() {
  const { currentUser, regionUrl } = useSealosStore();

  const { data: dbList } = useQuery(
    dbProviderListOptions(currentUser, regionUrl)
  );

  useCopilotAction({
    name: "getClusterList",
    description: "Get the list of database clusters",
    handler: () => {
      return dbList;
    },
    render: ({ status, result }) => {
      return <GetClusterListActionUI result={result} status={status} />;
    },
  });
}

export function startClusterAction() {
  const { currentUser, regionUrl } = useSealosStore();

  useCopilotAction({
    name: "startCluster",
    description: "Start one or more database clusters by name",
    available: "remote",
    parameters: [
      {
        name: "dbName",
        type: "string[]",
        description:
          "The name(s) of the database cluster(s) to start. Can be a single database name or array of database names.",
        required: true,
      },
    ],
    handler: async ({ dbName }) => {
      const dbNames = Array.isArray(dbName) ? dbName : [dbName];

      // Validate db names
      const { isValid, invalidNames } = validateDBNames(dbNames);
      if (!isValid) {
        return `Invalid database name(s): ${invalidNames.join(", ")}. Names must be non-empty and contain only lowercase letters, numbers, and hyphens.`;
      }

      try {
        const { summary } = await startMultipleDBs(
          dbNames.filter((n): n is string => Boolean(n)),
          currentUser,
          regionUrl
        );
        return summary;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        return `Failed to start databases: ${errorMessage}`;
      }
    },
    render: ({ status, args, result }) => {
      const { dbName } = args;
      return (
        <StartClusterActionUI
          dbName={dbName || []}
          result={result}
          status={status}
        />
      );
    },
  });
}

export function pauseClusterAction() {
  const { currentUser, regionUrl } = useSealosStore();

  useCopilotAction({
    name: "pauseCluster",
    description: "Pause one or more database clusters by name",
    available: "remote",
    parameters: [
      {
        name: "dbName",
        type: "string[]",
        description:
          "The name(s) of the database cluster(s) to pause. Can be a single database name or array of database names.",
        required: true,
      },
    ],
    handler: async ({ dbName }) => {
      const dbNames = Array.isArray(dbName) ? dbName : [dbName];

      // Validate db names
      const { isValid, invalidNames } = validateDBNames(dbNames);
      if (!isValid) {
        return `Invalid database name(s): ${invalidNames.join(", ")}. Names must be non-empty and contain only lowercase letters, numbers, and hyphens.`;
      }

      try {
        const { summary } = await pauseMultipleDBs(
          dbNames.filter((n): n is string => Boolean(n)),
          currentUser,
          regionUrl
        );
        return summary;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        return `Failed to pause databases: ${errorMessage}`;
      }
    },
    render: ({ status, args, result }) => {
      const { dbName } = args;
      return (
        <PauseClusterActionUI
          dbName={dbName || []}
          result={result}
          status={status}
        />
      );
    },
  });
}

export function deleteClusterAction() {
  const { currentUser, regionUrl } = useSealosStore();

  useCopilotAction({
    name: "deleteCluster",
    description: "Delete one or more database clusters by name",
    available: "enabled",
    parameters: [
      {
        name: "dbName",
        type: "string[]",
        description:
          "The name(s) of the database cluster(s) to delete. Can be a single database name or array of database names.",
        required: true,
      },
    ],
    renderAndWaitForResponse: ({ status, args, result, respond }) => {
      const { dbName } = args;
      const dbNames = Array.isArray(dbName) ? dbName : [dbName];

      // Validate db names
      const { isValid, invalidNames } = validateDBNames(dbNames);
      if (!isValid) {
        respond?.(
          `Invalid database name(s): ${invalidNames.join(", ")}. Names must be non-empty and contain only lowercase letters, numbers, and hyphens.`
        );
        return (
          <div className="space-y-2">
            <h2 className="font-semibold text-lg text-red-600">
              Invalid Database Names
            </h2>
            <p>
              Invalid database name(s):{" "}
              <strong>{invalidNames.join(", ")}</strong>
            </p>
            <p className="text-gray-600 text-sm">
              Names must be non-empty and contain only lowercase letters,
              numbers, and hyphens.
            </p>
          </div>
        );
      }

      return (
        <DeleteClusterActionUI
          dbName={dbName || []}
          onReject={() => {
            respond?.("User cancelled the database cluster deletion operation");
          }}
          onSelect={async () => {
            try {
              const { summary } = await deleteMultipleDBs(
                dbNames.filter((n): n is string => Boolean(n)),
                currentUser,
                regionUrl
              );
              respond?.(summary);
            } catch (error: unknown) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred";
              respond?.(`Failed to delete databases: ${errorMessage}`);
            }
          }}
          result={result}
          status={status}
        />
      );
    },
  });
}

export function createClusterAction() {
  const { currentUser, regionUrl } = useSealosStore();

  // Only allow dbTypes with non-empty versions
  const allowedDbTypes = Object.entries(DB_TYPE_VERSION_MAP)
    .filter(([_, versions]) => Array.isArray(versions) && versions.length > 0)
    .map(([dbType]) => dbType);

  useCopilotAction({
    name: "createCluster",
    description: "Create one or more database clusters from predefined types",
    available: "enabled",
    parameters: [
      {
        name: "dbType",
        type: "string[]",
        description: `The type(s) of the database cluster(s) to create. Can be a single type or array of types. Available types: ${allowedDbTypes.join(", ")}.`,
        required: true,
        enum: allowedDbTypes,
      },
    ],
    renderAndWaitForResponse: ({ status, args, result, respond }) => {
      const { dbType } = args;
      const dbTypes = Array.isArray(dbType) ? dbType : [dbType];
      const validDbTypes = dbTypes.filter(
        (type): type is string =>
          typeof type === "string" && type.trim().length > 0
      );

      // Validate that all dbTypes are valid
      const { isValid, invalidTypes } = validateDBTypes(
        validDbTypes,
        allowedDbTypes
      );
      if (!isValid) {
        respond?.(
          `Invalid database type(s): ${invalidTypes.join(", ")}. Available types: ${allowedDbTypes.join(", ")}.`
        );
        return (
          <div className="space-y-2">
            <h2 className="font-semibold text-lg text-red-600">
              Invalid Database Types
            </h2>
            <p>
              Invalid database type(s):{" "}
              <strong>{invalidTypes.join(", ")}</strong>
            </p>
            <p className="text-gray-600 text-sm">
              Available types: {allowedDbTypes.join(", ")}
            </p>
          </div>
        );
      }

      return (
        <CreateClusterActionUI
          dbType={validDbTypes.length === 1 ? validDbTypes[0] : validDbTypes}
          onReject={() => {
            respond?.("User cancelled the database cluster creation operation");
          }}
          onSelect={async () => {
            try {
              const dbForms = validDbTypes.map(
                (type) => generateDBFormFromType(type).dbForm
              );
              const { summary } = await createMultipleDBs(
                dbForms,
                currentUser,
                regionUrl
              );
              respond?.(summary);
            } catch (error: unknown) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred";
              respond?.(`Failed to create databases: ${errorMessage}`);
            }
          }}
          result={result}
          status={status}
        />
      );
    },
  });
}

export function useActivateClusterActions() {
  getClusterListAction();
  startClusterAction();
  pauseClusterAction();
  deleteClusterAction();
  createClusterAction();
}
