import { useCopilotAction } from "@copilotkit/react-core";
import { useSealosStore } from "@/store/sealos-store";
import { useQuery } from "@tanstack/react-query";
import { dbProviderListOptions } from "@/lib/sealos/dbprovider/dbprovider-query";
import {
  startDBByNameMutation,
  pauseDBByNameMutation,
  delDBByNameMutation,
  createDBMutation,
} from "@/lib/sealos/dbprovider/dbprovider-mutation";
import { generateDBFormFromType } from "@/lib/sealos/dbprovider/dbprovider-utils";
import { DB_TYPE_VERSION_MAP } from "@/lib/sealos/dbprovider/dbprovider-constant";

export function getClusterListAction() {
  const { currentUser, regionUrl } = useSealosStore();

  const { data: dbList } = useQuery(
    dbProviderListOptions(currentUser, regionUrl)
  );

  useCopilotAction({
    name: "getClusterList",
    description: "Get the list of database clusters",
    handler: async () => {
      return dbList;
    },
  });
}

export function startClusterAction() {
  const { currentUser, regionUrl } = useSealosStore();

  const { mutateAsync: startDB } = startDBByNameMutation(
    currentUser,
    regionUrl
  );

  useCopilotAction({
    name: "startCluster",
    description: "Start a specific database cluster by name",
    available: "remote",
    parameters: [
      {
        name: "dbName",
        type: "string",
        description: "The name of the database cluster to start",
        required: true,
      },
    ],
    handler: async ({ dbName }) => {
      await startDB(dbName);
    },
  });
}

export function pauseClusterAction() {
  const { currentUser, regionUrl } = useSealosStore();

  const { mutateAsync: pauseDB } = pauseDBByNameMutation(
    currentUser,
    regionUrl
  );

  useCopilotAction({
    name: "pauseCluster",
    description: "Pause a specific database cluster by name",
    available: "remote",
    parameters: [
      {
        name: "dbName",
        type: "string",
        description: "The name of the database cluster to pause",
        required: true,
      },
    ],
    handler: async ({ dbName }) => {
      await pauseDB(dbName);
    },
  });
}

export function deleteClusterAction() {
  const { currentUser, regionUrl } = useSealosStore();
  const { mutateAsync: deleteDB } = delDBByNameMutation(currentUser, regionUrl);

  useCopilotAction({
    name: "deleteCluster",
    description: "Delete a specific database cluster by name",
    available: "remote",
    parameters: [
      {
        name: "dbName",
        type: "string",
        description: "The name of the database cluster to delete",
        required: true,
      },
    ],
    handler: async ({ dbName }) => {
      await deleteDB(dbName);
    },
  });
}

export function createClusterAction() {
  const { currentUser, regionUrl } = useSealosStore();
  const { mutateAsync: createDB } = createDBMutation(currentUser, regionUrl);

  // Only allow dbTypes with non-empty versions
  const allowedDbTypes = Object.entries(DB_TYPE_VERSION_MAP)
    .filter(([_, versions]) => Array.isArray(versions) && versions.length > 0)
    .map(([dbType]) => dbType);

  useCopilotAction({
    name: "createCluster",
    description:
      "Create a database cluster by dbType (name will be generated automatically)",
    available: "remote",
    parameters: [
      {
        name: "dbType",
        type: "string",
        description:
          "The type of the database cluster (e.g., postgresql, kafka, etc.)",
        required: true,
        enum: allowedDbTypes,
      },
    ],
    handler: async ({ dbType }) => {
      const dbFormObj = generateDBFormFromType(dbType);
      await createDB(dbFormObj);
    },
  });
}

export function activateClusterActions() {
  getClusterListAction();
  startClusterAction();
  pauseClusterAction();
  deleteClusterAction();
  createClusterAction();
}
