import { useCopilotAction } from "@copilotkit/react-core";
import { useQuery } from "@tanstack/react-query";
import {
  CreateObjectStorageActionUI,
  DeleteObjectStorageActionUI,
  GetObjectStorageListActionUI,
} from "@/components/agent/objectstorage-action-ui";
import { directResourceListOptions } from "@/lib/sealos/k8s/k8s-query";
import {
  createMultipleObjectStorageBuckets,
  deleteMultipleObjectStorageBuckets,
} from "@/lib/sealos/objectstorage/objectstorage-mutation";
import { validateBucketNames } from "@/lib/sealos/objectstorage/objectstorage-utils";
import { useSealosStore } from "@/store/sealos-store";

export function getObjectStorageListAction() {
  const { currentUser } = useSealosStore();

  const { data: objectStorageList } = useQuery(
    directResourceListOptions(currentUser, "objectstoragebucket")
  );

  useCopilotAction({
    name: "getObjectStorageList",
    description: "Get the list of object storage buckets",
    handler: () => {
      return objectStorageList;
    },
    render: ({ status, result }) => {
      return (
        <GetObjectStorageListActionUI
          bucketName={[]}
          result={result}
          status={status}
        />
      );
    },
  });
}

export function createObjectStorageAction() {
  const { currentUser, regionUrl } = useSealosStore();

  useCopilotAction({
    name: "createObjectStorage",
    description: "Create one or more object storage buckets",
    available: "enabled",
    parameters: [
      {
        name: "count",
        type: "number",
        description:
          "Number of object storage buckets to create (defaults to 1)",
        required: false,
      },
    ],
    renderAndWaitForResponse: ({ status, args, result, respond }) => {
      const { count = 1 } = args;
      const bucketCount = Math.max(1, Math.min(count || 1, 10)); // Limit to max 10 buckets

      return (
        <CreateObjectStorageActionUI
          bucketName={new Array(bucketCount).fill("auto-generated")}
          onReject={() => {
            respond?.(
              "User cancelled the object storage bucket creation operation"
            );
          }}
          onSelect={async () => {
            try {
              const { summary } = await createMultipleObjectStorageBuckets(
                bucketCount,
                currentUser,
                regionUrl
              );
              respond?.(summary);
            } catch (error: unknown) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred";
              respond?.(
                `Failed to create object storage buckets: ${errorMessage}`
              );
            }
          }}
          result={result}
          status={status}
        />
      );
    },
  });
}

export function deleteObjectStorageAction() {
  const { currentUser, regionUrl } = useSealosStore();

  useCopilotAction({
    name: "deleteObjectStorage",
    description: "Delete one or more object storage buckets by name",
    available: "enabled",
    parameters: [
      {
        name: "bucketName",
        type: "string[]",
        description:
          "The name(s) of the object storage bucket(s) to delete. Can be a single bucket name or array of bucket names.",
        required: true,
      },
    ],
    renderAndWaitForResponse: ({ status, args, result, respond }) => {
      const { bucketName } = args;
      const bucketNames = Array.isArray(bucketName) ? bucketName : [bucketName];

      // Validate bucket names
      const { isValid, invalidNames } = validateBucketNames(bucketNames);
      if (!isValid) {
        respond?.(
          `Invalid bucket name(s): ${invalidNames.join(", ")}. Names must be non-empty and contain only lowercase letters, numbers, and hyphens.`
        );
        return (
          <div className="space-y-2">
            <h2 className="font-semibold text-lg text-red-600">
              Invalid Bucket Names
            </h2>
            <p>
              Invalid bucket name(s): <strong>{invalidNames.join(", ")}</strong>
            </p>
            <p className="text-gray-600 text-sm">
              Names must be non-empty and contain only lowercase letters,
              numbers, and hyphens.
            </p>
          </div>
        );
      }

      return (
        <DeleteObjectStorageActionUI
          bucketName={bucketName || []}
          onReject={() => {
            respond?.(
              "User cancelled the object storage bucket deletion operation"
            );
          }}
          onSelect={async () => {
            try {
              const { summary } = await deleteMultipleObjectStorageBuckets(
                bucketNames.filter((n): n is string => Boolean(n)),
                currentUser,
                regionUrl
              );
              respond?.(summary);
            } catch (error: unknown) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred";
              respond?.(
                `Failed to delete object storage buckets: ${errorMessage}`
              );
            }
          }}
          result={result}
          status={status}
        />
      );
    },
  });
}

export function useActivateObjectStorageActions() {
  getObjectStorageListAction();
  createObjectStorageAction();
  deleteObjectStorageAction();
}
