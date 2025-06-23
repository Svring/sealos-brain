import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import { queryDebugLog } from "@/lib/query-debug-log";

function getCronJobHeaders(currentUser: any) {
  return {
    Authorization:
      currentUser?.tokens?.find((t: any) => t.type === "kubeconfig")?.value ||
      "",
  };
}

export function cronJobListOptions(
  currentUser: any,
  regionUrl: string | undefined,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["cronjob", "list", regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl,
    queryFn: async () => {
      queryDebugLog("cronJobListOptions", {
        regionUrl,
        userId: currentUser?.id,
      });
      const headers = getCronJobHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/cronjob/getCronJobList?regionUrl=${regionUrl}`,
        { headers }
      );
      return response.data;
    },
    select: postprocess,
  });
}

// Usage example:
// const { currentUser, regionUrl } = useSealosStore();
// const query = useQuery(cronJobListOptions(currentUser, regionUrl));
