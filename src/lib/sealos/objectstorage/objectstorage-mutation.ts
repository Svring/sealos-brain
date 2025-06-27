import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { customAlphabet } from "nanoid";
import { toast } from "sonner";
import type { User } from "@/payload-types";

interface BulkOperationResult<T = unknown> {
  success: boolean;
  item: string;
  result?: T;
  error?: string;
}

// Create a custom nanoid with lowercase alphabet and size 12
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz", 12);

// Helper to get headers from currentUser
function getObjectStorageHeaders(currentUser: User | null) {
  return {
    Authorization:
      currentUser?.tokens?.find((t) => t.type === "kubeconfig")?.value || "",
    "app-token":
      currentUser?.tokens?.find((t) => t.type === "custom")?.value || "",
  };
}

// Create Object Storage Bucket
export function createObjectStorageBucketMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!regionUrl) {
        throw new Error("Region URL is required");
      }

      // Generate random bucket name and default to private policy
      const bucketName = `bucket-${nanoid()}`;
      const bucketPolicy = "private";

      const headers = getObjectStorageHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/objectstorage/bucket/create?regionUrl=${regionUrl}`,
        { bucketName, bucketPolicy },
        { headers }
      );
      return { ...response.data, bucketName, bucketPolicy };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["objectstorage", "list"] });
      toast.success(
        `Object storage bucket '${data.bucketName}' is successfully created`
      );
    },
    onError: (error: Error) => {
      toast.error(`Failed to create object storage bucket: ${error.message}`);
    },
  });
}

// Delete Object Storage Bucket
export function deleteObjectStorageBucketMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bucketName: string) => {
      if (!regionUrl) {
        throw new Error("Region URL is required");
      }

      const headers = getObjectStorageHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/objectstorage/bucket/delete?regionUrl=${regionUrl}`,
        { bucketName },
        { headers }
      );
      return { ...response.data, bucketName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["objectstorage", "list"] });
      toast.success(
        `Object storage bucket '${data.bucketName}' is successfully deleted`
      );
    },
    onError: (error: Error, bucketName) => {
      toast.error(
        `Failed to delete object storage bucket '${bucketName}': ${error.message}`
      );
    },
  });
}

/**
 * Create multiple object storage buckets concurrently
 */
export async function createMultipleObjectStorageBuckets(
  count: number,
  currentUser: User | null,
  regionUrl: string | undefined
): Promise<{
  successful: BulkOperationResult[];
  failed: BulkOperationResult[];
  summary: string;
}> {
  const bucketCreations = Array.from({ length: count }, () => ({}));

  const results = await Promise.all(
    bucketCreations.map(async (_, index) => {
      try {
        if (!regionUrl) {
          throw new Error("Region URL is required");
        }

        // Generate random bucket name and default to private policy
        const bucketName = `bucket-${nanoid()}`;
        const bucketPolicy = "private";

        const headers = getObjectStorageHeaders(currentUser);
        await axios.post(
          `/api/sealos/objectstorage/bucket/create?regionUrl=${regionUrl}`,
          { bucketName, bucketPolicy },
          { headers }
        );

        return {
          success: true,
          item: bucketName,
          result: bucketName,
        } as BulkOperationResult;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        return {
          success: false,
          item: `bucket-${index + 1}`,
          error: errorMessage,
        } as BulkOperationResult;
      }
    })
  );

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  let summary = "";
  if (successful.length > 0) {
    summary += `Successfully created ${successful.length} object storage bucket(s):\n`;
    for (const r of successful) {
      summary += `- '${r.result}'\n`;
    }
  }
  if (failed.length > 0) {
    summary += `\nFailed to create ${failed.length} object storage bucket(s):\n`;
    for (const r of failed) {
      summary += `- ${r.item}: ${r.error}\n`;
    }
  }

  return { successful, failed, summary: summary.trim() };
}

/**
 * Delete multiple object storage buckets concurrently
 */
export async function deleteMultipleObjectStorageBuckets(
  bucketNames: string[],
  currentUser: User | null,
  regionUrl: string | undefined
): Promise<{
  successful: BulkOperationResult[];
  failed: BulkOperationResult[];
  summary: string;
}> {
  const results = await Promise.all(
    bucketNames.map(async (name) => {
      try {
        if (!regionUrl) {
          throw new Error("Region URL is required");
        }

        const headers = getObjectStorageHeaders(currentUser);
        const response = await axios.post(
          `/api/sealos/objectstorage/bucket/delete?regionUrl=${regionUrl}`,
          { bucketName: name },
          { headers }
        );

        const result = { ...response.data, bucketName: name };

        return {
          success: true,
          item: name,
          result: result.bucketName || name,
        } as BulkOperationResult;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        return {
          success: false,
          item: name,
          error: errorMessage,
        } as BulkOperationResult;
      }
    })
  );

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  let summary = "";
  if (successful.length > 0) {
    summary += `Successfully deleted ${successful.length} object storage bucket(s):\n`;
    for (const r of successful) {
      summary += `- '${r.result}'\n`;
    }
  }
  if (failed.length > 0) {
    summary += `\nFailed to delete ${failed.length} object storage bucket(s):\n`;
    for (const r of failed) {
      summary += `- '${r.item}': ${r.error}\n`;
    }
  }

  return { successful, failed, summary: summary.trim() };
}
