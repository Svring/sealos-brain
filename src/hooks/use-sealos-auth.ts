import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import { queryDebugLog } from "@/lib/tracing/query-debug-log";

function getRegionToken(currentUser: any) {
  return (
    currentUser?.tokens?.find((t: any) => t.type === "region_token")?.value ||
    ""
  );
}

export function authInfoOptions(
  currentUser: any,
  regionUrl: string | undefined,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["auth", "info", regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl,
    queryFn: async () => {
      queryDebugLog("authInfoOptions", { regionUrl, userId: currentUser?.id });
      const regionToken = getRegionToken(currentUser);
      const response = await axios.get(
        `/api/sealos/auth/info?regionUrl=${regionUrl}`,
        {
          headers: {
            Authorization: `${regionToken}`,
          },
        }
      );
      return response.data;
    },
    select: postprocess,
  });
}
