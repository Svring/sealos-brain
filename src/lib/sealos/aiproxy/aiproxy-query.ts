import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import { queryDebugLog } from "@/lib/query-debug-log";

function getAIProxyHeaders(currentUser: any) {
  return {
    Authorization:
      currentUser?.tokens?.find((t: any) => t.type === "app_token")?.value ||
      "",
  };
}

export function aiProxyTokenListOptions(
  currentUser: any,
  regionUrl: string | undefined,
  page: number = 1,
  perPage: number = 10,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "aiproxy",
      "token",
      "list",
      page,
      perPage,
      regionUrl,
      currentUser?.id,
    ],
    enabled: !!currentUser && !!regionUrl,
    queryFn: async () => {
      queryDebugLog("aiProxyTokenListOptions", {
        regionUrl,
        userId: currentUser?.id,
        page,
        perPage,
      });
      const headers = getAIProxyHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/aiproxy/user/token?regionUrl=${regionUrl}&page=${page}&perPage=${perPage}`,
        { headers }
      );
      return response.data;
    },
    select: postprocess,
  });
}

export function createAIProxyTokenOptions(
  currentUser: any,
  regionUrl: string | undefined
) {
  return {
    mutationFn: async (data: { name: string }) => {
      queryDebugLog("createAIProxyToken", {
        regionUrl,
        userId: currentUser?.id,
        tokenName: data.name,
      });
      const headers = getAIProxyHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/aiproxy/user/token?regionUrl=${regionUrl}`,
        data,
        { headers }
      );
      return response.data;
    },
  };
}

// Usage example:
// const { currentUser, regionUrl } = useSealosStore();
// const tokensQuery = useQuery(aiProxyTokenListOptions(currentUser, regionUrl, 1, 10));
// const createTokenMutation = useMutation(createAIProxyTokenOptions(currentUser, regionUrl));
