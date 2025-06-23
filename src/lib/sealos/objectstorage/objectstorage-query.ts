import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import { queryDebugLog } from "@/lib/query-debug-log";

function getObjectStorageHeaders(currentUser: any) {
  return {
    Authorization:
      currentUser?.tokens?.find((t: any) => t.type === "kubeconfig")?.value ||
      "",
    "app-token":
      currentUser?.tokens?.find((t: any) => t.type === "app_token")?.value ||
      "",
  };
}

export function objectStorageBucketListOptions(
  currentUser: any,
  regionUrl: string | undefined,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["objectstorage", "bucket", "list", regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl,
    queryFn: async () => {
      queryDebugLog("objectStorageBucketListOptions", {
        regionUrl,
        userId: currentUser?.id,
      });
      const headers = getObjectStorageHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/objectstorage/bucket/list?regionUrl=${regionUrl}`,
        { headers }
      );
      return response.data;
    },
    select: postprocess,
  });
}

// Usage example:
// const { currentUser, regionUrl } = useSealosStore();
// const bucketsQuery = useQuery(objectStorageBucketListOptions(currentUser, regionUrl));
