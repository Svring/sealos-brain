import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import { queryDebugLog } from "@/lib/query-debug-log";

function getAppLaunchpadHeaders(currentUser: any) {
  return {
    Authorization:
      currentUser?.tokens?.find((t: any) => t.type === "kubeconfig")?.value ||
      "",
  };
}

export function appLaunchpadListOptions(
  currentUser: any,
  regionUrl: string | undefined,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["applaunchpad", "list", regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl,
    queryFn: async () => {
      queryDebugLog("appLaunchpadListOptions", {
        regionUrl,
        userId: currentUser?.id,
      });
      const headers = getAppLaunchpadHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/applaunchpad/getApps?regionUrl=${regionUrl}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function appLaunchpadByNameOptions(
  currentUser: any,
  regionUrl: string | undefined,
  appName: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["applaunchpad", "byName", appName, regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl && !!appName,
    queryFn: async () => {
      queryDebugLog("appLaunchpadByNameOptions", {
        regionUrl,
        userId: currentUser?.id,
        appName,
      });
      const headers = getAppLaunchpadHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/applaunchpad/getAppByAppName?regionUrl=${regionUrl}&appName=${appName}&mock=false`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function appLaunchpadPodsByAppNameOptions(
  currentUser: any,
  regionUrl: string | undefined,
  appName: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["applaunchpad", "pods", appName, regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl && !!appName,
    queryFn: async () => {
      queryDebugLog("appLaunchpadPodsByAppNameOptions", {
        regionUrl,
        userId: currentUser?.id,
        appName,
      });
      const headers = getAppLaunchpadHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/applaunchpad/getAppPodsByAppName?regionUrl=${regionUrl}&name=${appName}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function appLaunchpadCheckReadyOptions(
  currentUser: any,
  regionUrl: string | undefined,
  appName: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "applaunchpad",
      "checkReady",
      appName,
      regionUrl,
      currentUser?.id,
    ],
    enabled: !!currentUser && !!regionUrl && !!appName,
    queryFn: async () => {
      queryDebugLog("appLaunchpadCheckReadyOptions", {
        regionUrl,
        userId: currentUser?.id,
        appName,
      });
      const headers = getAppLaunchpadHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/applaunchpad/checkReady?regionUrl=${regionUrl}&appName=${appName}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function appLaunchpadMonitorDataOptions(
  currentUser: any,
  regionUrl: string | undefined,
  params: any,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["applaunchpad", "monitor", params, regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl && !!params,
    queryFn: async () => {
      queryDebugLog("appLaunchpadMonitorDataOptions", {
        regionUrl,
        userId: currentUser?.id,
        params,
      });
      const headers = getAppLaunchpadHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/applaunchpad/monitor/getMonitorData?regionUrl=${regionUrl}&${new URLSearchParams(params).toString()}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function appLaunchpadPodsMetricsOptions(
  currentUser: any,
  regionUrl: string | undefined,
  appName: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "applaunchpad",
      "podsMetrics",
      appName,
      regionUrl,
      currentUser?.id,
    ],
    enabled: !!currentUser && !!regionUrl && !!appName,
    queryFn: async () => {
      queryDebugLog("appLaunchpadPodsMetricsOptions", {
        regionUrl,
        userId: currentUser?.id,
        appName,
      });
      const headers = getAppLaunchpadHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/applaunchpad/getPodsMetrics?regionUrl=${regionUrl}&appName=${appName}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

// Usage example:
// const { currentUser, regionUrl } = useSealosStore();
// const query = useQuery(appLaunchpadListOptions(currentUser, regionUrl));
