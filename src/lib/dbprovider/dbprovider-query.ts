import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import { queryDebugLog } from "@/lib/tracing/query-debug-log";

function getDBProviderHeaders(currentUser: any) {
  return {
    Authorization:
      currentUser?.tokens?.find((t: any) => t.type === "kubeconfig")?.value ||
      "",
  };
}

export function dbProviderListOptions(
  currentUser: any,
  regionUrl: string | undefined,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["dbprovider", "list", regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl,
    queryFn: async () => {
      queryDebugLog("dbProviderListOptions", {
        regionUrl,
        userId: currentUser?.id,
      });
      const headers = getDBProviderHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/dbprovider/getDBList?regionUrl=${regionUrl}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function dbProviderByNameOptions(
  currentUser: any,
  regionUrl: string | undefined,
  dbName: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["dbprovider", "byName", dbName, regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl && !!dbName,
    queryFn: async () => {
      queryDebugLog("dbProviderByNameOptions", {
        regionUrl,
        userId: currentUser?.id,
        dbName,
      });
      const headers = getDBProviderHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/dbprovider/getDBByName?regionUrl=${regionUrl}&name=${dbName}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function dbProviderConnectionInfoOptions(
  currentUser: any,
  regionUrl: string | undefined,
  dbName: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "dbprovider",
      "connectionInfo",
      dbName,
      regionUrl,
      currentUser?.id,
    ],
    enabled: !!currentUser && !!regionUrl && !!dbName,
    queryFn: async () => {
      queryDebugLog("dbProviderConnectionInfoOptions", {
        regionUrl,
        userId: currentUser?.id,
        dbName,
      });
      const headers = getDBProviderHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/dbprovider/getConnectionInfo?regionUrl=${regionUrl}&name=${dbName}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function dbProviderStatusOptions(
  currentUser: any,
  regionUrl: string | undefined,
  dbName: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["dbprovider", "status", dbName, regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl && !!dbName,
    queryFn: async () => {
      queryDebugLog("dbProviderStatusOptions", {
        regionUrl,
        userId: currentUser?.id,
        dbName,
      });
      const headers = getDBProviderHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/dbprovider/getDBStatus?regionUrl=${regionUrl}&name=${dbName}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function dbProviderMonitorDataOptions(
  currentUser: any,
  regionUrl: string | undefined,
  params: any,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["dbprovider", "monitor", params, regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl && !!params,
    queryFn: async () => {
      queryDebugLog("dbProviderMonitorDataOptions", {
        regionUrl,
        userId: currentUser?.id,
        params,
      });
      const headers = getDBProviderHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/dbprovider/monitor/getMonitorData?regionUrl=${regionUrl}&${new URLSearchParams(params).toString()}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

// Usage example:
// const { currentUser, regionUrl } = useSealosStore();
// const query = useQuery(dbProviderListOptions(currentUser, regionUrl));
