"use client";

import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import { queryDebugLog } from "@/lib/tracing/query-debug-log";

function getRegionToken(currentUser: any) {
  return (
    currentUser?.tokens?.find((t: any) => t.type === "region_token")?.value ||
    ""
  );
}

export function accountAmountOptions(
  currentUser: any,
  regionUrl: string | undefined,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["account", "amount", regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl,
    queryFn: async () => {
      queryDebugLog("accountAmountOptions", {
        regionUrl,
        userId: currentUser?.id,
      });
      const regionToken = getRegionToken(currentUser);
      const response = await axios.get(
        `/api/sealos/account/getAmount?regionUrl=${regionUrl}`,
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
