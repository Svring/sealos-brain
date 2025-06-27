import { useCopilotAction } from "@copilotkit/react-core";
import { useSealosStore } from "@/store/sealos-store";
import { useQuery } from "@tanstack/react-query";
import { directResourceListOptions } from "@/lib/sealos/k8s/k8s-query";
import {
  createObjectStorageBucketMutation,
  deleteObjectStorageBucketMutation,
} from "@/lib/sealos/objectstorage/objectstorage-mutation";

export function getObjectStorageListAction() {
  const { currentUser } = useSealosStore();

  const { data: objectStorageList } = useQuery(
    directResourceListOptions(currentUser, "objectstoragebucket")
  );

  useCopilotAction({
    name: "getObjectStorageList",
    description: "Get the list of object storage buckets",
    handler: async () => {
      return objectStorageList;
    },
  });
}

export function createObjectStorageAction() {
  const { currentUser, regionUrl } = useSealosStore();
  const { mutateAsync: createBucket } = createObjectStorageBucketMutation(
    currentUser,
    regionUrl
  );

  useCopilotAction({
    name: "createObjectStorage",
    description:
      "Create a new object storage bucket (name will be generated automatically)",
    available: "remote",
    handler: async () => {
      const result = await createBucket();
      return `Object storage bucket '${result.bucketName}' is successfully created`;
    },
  });
}

export function deleteObjectStorageAction() {
  const { currentUser, regionUrl } = useSealosStore();
  const { mutateAsync: deleteBucket } = deleteObjectStorageBucketMutation(
    currentUser,
    regionUrl
  );

  useCopilotAction({
    name: "deleteObjectStorage",
    description: "Delete an object storage bucket by name",
    available: "remote",
    parameters: [
      {
        name: "bucketName",
        type: "string",
        description: "The name of the object storage bucket to delete",
        required: true,
      },
    ],
    handler: async ({ bucketName }) => {
      const result = await deleteBucket(bucketName);
      return `Object storage bucket '${result.bucketName || bucketName}' is successfully deleted`;
    },
  });
}

export function useActivateObjectStorageActions() {
  getObjectStorageListAction();
  createObjectStorageAction();
  deleteObjectStorageAction();
}
