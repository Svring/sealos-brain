import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import { queryDebugLog } from "@/lib/tracing/query-debug-log";

function getDevboxHeaders(currentUser: any) {
  return {
    Authorization:
      currentUser?.tokens?.find((t: any) => t.type === "kubeconfig")?.value ||
      "",
    "Authorization-Bearer":
      currentUser?.tokens?.find((t: any) => t.type === "custom")?.value || "",
  };
}

export function devboxListOptions(
  currentUser: any,
  regionUrl: string | undefined,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["devbox", "list", regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl,
    queryFn: async () => {
      queryDebugLog("devboxListOptions", {
        regionUrl,
        userId: currentUser?.id,
      });
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/devbox/getDevboxList?regionUrl=${regionUrl}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function devboxByNameOptions(
  currentUser: any,
  regionUrl: string | undefined,
  devboxName: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["devbox", "byName", devboxName, regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl && !!devboxName,
    queryFn: async () => {
      queryDebugLog("devboxByNameOptions", {
        regionUrl,
        userId: currentUser?.id,
        devboxName,
      });
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/devbox/getDevboxByName?regionUrl=${regionUrl}&devboxName=${devboxName}&mock=false`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function sshConnectionInfoOptions(
  currentUser: any,
  regionUrl: string | undefined,
  devboxName: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["devbox", "sshInfo", devboxName, regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl && !!devboxName,
    queryFn: async () => {
      queryDebugLog("sshConnectionInfoOptions", {
        regionUrl,
        userId: currentUser?.id,
        devboxName,
      });
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/devbox/getSSHConnectionInfo?regionUrl=${regionUrl}&devboxName=${devboxName}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function devboxReadyStatusOptions(
  currentUser: any,
  regionUrl: string | undefined,
  devboxName: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["devbox", "checkReady", devboxName, regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl && !!devboxName,
    queryFn: async () => {
      queryDebugLog("devboxReadyStatusOptions", {
        regionUrl,
        userId: currentUser?.id,
        devboxName,
      });
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/devbox/checkReady?regionUrl=${regionUrl}&devboxName=${devboxName}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function appsByDevboxIdOptions(
  currentUser: any,
  regionUrl: string | undefined,
  devboxId: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["devbox", "getApps", devboxId, regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl && !!devboxId,
    queryFn: async () => {
      queryDebugLog("appsByDevboxIdOptions", {
        regionUrl,
        userId: currentUser?.id,
        devboxId,
      });
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/devbox/getAppsByDevboxId?regionUrl=${regionUrl}&devboxId=${devboxId}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function devboxPodsByDevboxNameOptions(
  currentUser: any,
  regionUrl: string | undefined,
  devboxName: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["devbox", "getPods", devboxName, regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl && !!devboxName,
    queryFn: async () => {
      queryDebugLog("devboxPodsByDevboxNameOptions", {
        regionUrl,
        userId: currentUser?.id,
        devboxName,
      });
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/devbox/getDevboxPodsByDevboxName?regionUrl=${regionUrl}&devboxName=${devboxName}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function devboxVersionListOptions(
  currentUser: any,
  regionUrl: string | undefined,
  devboxName: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "devbox",
      "getVersionList",
      devboxName,
      regionUrl,
      currentUser?.id,
    ],
    enabled: !!currentUser && !!regionUrl && !!devboxName,
    queryFn: async () => {
      queryDebugLog("devboxVersionListOptions", {
        regionUrl,
        userId: currentUser?.id,
        devboxName,
      });
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/devbox/getDevboxVersionList?regionUrl=${regionUrl}&devboxName=${devboxName}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function devboxEnvOptions(
  currentUser: any,
  regionUrl: string | undefined,
  devboxName: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["devbox", "getEnv", devboxName, regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl && !!devboxName,
    queryFn: async () => {
      queryDebugLog("devboxEnvOptions", {
        regionUrl,
        userId: currentUser?.id,
        devboxName,
      });
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/devbox/getEnv?regionUrl=${regionUrl}&devboxName=${devboxName}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function monitorDataOptions(
  currentUser: any,
  regionUrl: string | undefined,
  params: any,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["devbox", "monitor", params, regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl && !!params,
    queryFn: async () => {
      queryDebugLog("monitorDataOptions", {
        regionUrl,
        userId: currentUser?.id,
        params,
      });
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/devbox/monitor/getMonitorData?regionUrl=${regionUrl}&${new URLSearchParams(params).toString()}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function templateRepositoryListOptions(
  currentUser: any,
  regionUrl: string | undefined,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["devbox", "templateRepo", "list", regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl,
    queryFn: async () => {
      queryDebugLog("templateRepositoryListOptions", {
        regionUrl,
        userId: currentUser?.id,
      });
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/devbox/templateRepository/list?regionUrl=${regionUrl}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function templateRepositoryListOfficialOptions(
  currentUser: any,
  regionUrl: string | undefined,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "devbox",
      "templateRepo",
      "listOfficial",
      regionUrl,
      currentUser?.id,
    ],
    enabled: !!currentUser && !!regionUrl,
    queryFn: async () => {
      queryDebugLog("templateRepositoryListOfficialOptions", {
        regionUrl,
        userId: currentUser?.id,
      });
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/devbox/templateRepository/listOfficial?regionUrl=${regionUrl}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function templateRepositoryListPrivateOptions(
  currentUser: any,
  regionUrl: string | undefined,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "devbox",
      "templateRepo",
      "listPrivate",
      regionUrl,
      currentUser?.id,
    ],
    enabled: !!currentUser && !!regionUrl,
    queryFn: async () => {
      queryDebugLog("templateRepositoryListPrivateOptions", {
        regionUrl,
        userId: currentUser?.id,
      });
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/devbox/templateRepository/listPrivate?regionUrl=${regionUrl}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function templateRepositoryTagListOptions(
  currentUser: any,
  regionUrl: string | undefined,
  params: any,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "devbox",
      "templateRepo",
      "tag",
      "list",
      params,
      regionUrl,
      currentUser?.id,
    ],
    enabled: !!currentUser && !!regionUrl && !!params,
    queryFn: async () => {
      queryDebugLog("templateRepositoryTagListOptions", {
        regionUrl,
        userId: currentUser?.id,
        params,
      });
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/devbox/templateRepository/tag/list?regionUrl=${regionUrl}&${new URLSearchParams(params).toString()}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function templateRepositoryGetOptions(
  currentUser: any,
  regionUrl: string | undefined,
  id: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["devbox", "templateRepo", "get", id, regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl && !!id,
    queryFn: async () => {
      queryDebugLog("templateRepositoryGetOptions", {
        regionUrl,
        userId: currentUser?.id,
        id,
      });
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/devbox/templateRepository/get?regionUrl=${regionUrl}&id=${id}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function templateRepositoryTemplateGetConfigOptions(
  currentUser: any,
  regionUrl: string | undefined,
  id: string,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "devbox",
      "templateRepo",
      "template",
      "getConfig",
      id,
      regionUrl,
      currentUser?.id,
    ],
    enabled: !!currentUser && !!regionUrl && !!id,
    queryFn: async () => {
      queryDebugLog("templateRepositoryTemplateGetConfigOptions", {
        regionUrl,
        userId: currentUser?.id,
        id,
      });
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/devbox/templateRepository/template/getConfig?regionUrl=${regionUrl}&id=${id}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function templateRepositoryTemplateListOptions(
  currentUser: any,
  regionUrl: string | undefined,
  params: any,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: [
      "devbox",
      "templateRepo",
      "template",
      "list",
      params,
      regionUrl,
      currentUser?.id,
    ],
    enabled: !!currentUser && !!regionUrl && !!params,
    queryFn: async () => {
      queryDebugLog("templateRepositoryTemplateListOptions", {
        regionUrl,
        userId: currentUser?.id,
        params,
      });
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/devbox/templateRepository/template/list?regionUrl=${regionUrl}&${new URLSearchParams(params).toString()}`,
        { headers }
      );
      return response.data.data;
    },
    select: postprocess,
  });
}

export function devboxQuotaOptions(
  currentUser: any,
  regionUrl: string | undefined,
  postprocess: (data: any) => any = (d) => d
) {
  return queryOptions({
    queryKey: ["devbox", "quota", regionUrl, currentUser?.id],
    enabled: !!currentUser && !!regionUrl,
    queryFn: async () => {
      queryDebugLog("devboxQuotaOptions", {
        regionUrl,
        userId: currentUser?.id,
      });
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.get(
        `/api/sealos/devbox/platform/getQuota?regionUrl=${regionUrl}`,
        { headers }
      );
      return response.data;
    },
    select: postprocess,
  });
}

// Usage example:
// const { currentUser, regionUrl } = useSealosStore();
// const query = useQuery(devboxListOptions(currentUser, regionUrl));
