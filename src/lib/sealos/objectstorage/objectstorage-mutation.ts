import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { customAlphabet } from "nanoid";
import { toast } from "sonner";

// Create a custom nanoid with lowercase alphabet and size 12
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz", 12);

// Helper to get headers from currentUser
function getObjectStorageHeaders(currentUser: any) {
  return {
    Authorization:
      currentUser?.tokens?.find((t: any) => t.type === "kubeconfig")?.value ||
      "",
    "app-token":
      currentUser?.tokens?.find((t: any) => t.type === "custom")?.value || "",
  };
}

// Create Object Storage Bucket
export function createObjectStorageBucketMutation(
  currentUser: any,
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
    onError: (error: any) => {
      toast.error(`Failed to create object storage bucket: ${error.message}`);
    },
  });
}

// Delete Object Storage Bucket
export function deleteObjectStorageBucketMutation(
  currentUser: any,
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
    onError: (error: any, bucketName) => {
      toast.error(
        `Failed to delete object storage bucket '${bucketName}': ${error.message}`
      );
    },
  });
}
