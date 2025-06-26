import { useCopilotAction } from "@copilotkit/react-core";
import { useSealosStore } from "@/store/sealos-store";
import { useQuery } from "@tanstack/react-query";
import { directResourceListOptions } from "@/lib/sealos/k8s/k8s-query";
import { dbProviderListOptions } from "@/lib/sealos/dbprovider/dbprovider-query";
import {
  startDBByNameMutation,
  pauseDBByNameMutation,
  delDBByNameMutation,
} from "@/lib/sealos/dbprovider/dbprovider-mutation";

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

export function activateClusterActions() {
  getClusterListAction();
  startClusterAction();
  pauseClusterAction();
  deleteClusterAction();
}
