import { useCallback } from "react";
import { useSealosStore } from "@/store/sealos-store";
import { getCurrentUser } from "@/database/actions/user-actions";
import { createDevboxContext } from "@/lib/devbox/devbox-provider";
import {
  DevboxContext,
  buildDevboxUrls,
  buildPlatformUrls,
  createDevboxFetchOptions,
  createDevboxPostFetchOptions,
  createDevboxApiContext,
  transformDevboxList,
  transformCheckReady,
  transformStartDevbox,
  transformShutdownDevbox,
  transformRestartDevbox,
  transformCreateDevbox,
  transformDelDevbox,
  transformUpdateDevbox,
  transformDevboxByName,
  transformSSHConnectionInfo,
  transformDelDevboxVersionByName,
  transformEditDevboxVersion,
  transformExecCommandInDevboxPod,
  transformGetAppsByDevboxId,
  transformGetDevboxPodsByDevboxName,
  transformGetDevboxVersionList,
  transformGetEnv,
  transformReleaseDevbox,
  transformTemplateRepositoryDelete,
  transformTemplateRepositoryGet,
  transformTemplateRepositoryList,
  transformTemplateRepositoryListOfficial,
  transformTemplateRepositoryListPrivate,
  transformTemplateRepositoryTagList,
  transformTemplateRepositoryTemplateDelete,
  transformTemplateRepositoryTemplateGetConfig,
  transformTemplateRepositoryTemplateList,
  transformTemplateRepositoryUpdate,
  transformTemplateRepositoryWithTemplateCreate,
  transformTemplateRepositoryWithTemplateUpdate,
  transformPlatformAuthCname,
  transformPlatformGetDebt,
  transformPlatformGetQuota,
  transformPlatformResourcePrice,
} from "@/lib/devbox/devbox-utils";
import { runWake } from "@/lib/wake";

type ShutdownModeType = "Stopped" | "Shutdown";

export function useSealosDevbox() {
  const {
    currentUser,
    regionUrl,
    setCurrentUser,
    setRegionUrl,
    getApiData,
    setApiData,
    isApiDataValid,
    hasRequiredTokens,
  } = useSealosStore();

  const devboxAction = useCallback(
    async (
      url: string,
      transformation: (data: any) => any,
      fetchOptions: any,
      invalidateList: boolean = false,
      cacheKey?: string
    ) => {
      try {
        // For GET requests, check cache first
        if (fetchOptions.method === "GET" && cacheKey) {
          const cachedData = getApiData("devbox", cacheKey, regionUrl);
          if (cachedData && isApiDataValid("devbox", cacheKey, regionUrl)) {
            console.log(`Using cached data for ${cacheKey}`);
            return cachedData;
          }
        }

        const user = currentUser || (await getCurrentUser());
        if (!user) {
          throw new Error("No user found");
        }
        const currentRegionUrl = regionUrl;

        if (!hasRequiredTokens("devbox")) {
          throw new Error("User missing required tokens for devbox operations");
        }

        const devboxContext = await createDevboxContext(user, currentRegionUrl);
        if (!devboxContext) {
          throw new Error("Failed to create devbox context - missing tokens");
        }

        const apiContext = createDevboxApiContext(devboxContext);

        const [result] = await runWake({
          urls: [url],
          transformations: [transformation],
          fetchOptions: {
            ...fetchOptions,
            params: { ...fetchOptions.params, regionUrl: currentRegionUrl },
          },
          context: apiContext,
        });

        if (invalidateList) {
          setApiData("devbox", "getDevboxList", null, currentRegionUrl);
        }

        if (cacheKey) {
          setApiData("devbox", cacheKey, result, currentRegionUrl);
        }

        return result;
      } catch (error) {
        console.error(`Error performing devbox action for ${url}:`, error);
        throw error;
      }
    },
    [
      currentUser,
      regionUrl,
      hasRequiredTokens,
      setApiData,
      getApiData,
      isApiDataValid,
      setCurrentUser,
    ]
  );

  const fetchDevboxList = useCallback(
    async (forceRefresh = false) => {
      const urls = buildDevboxUrls();
      if (forceRefresh) {
        setApiData("devbox", "getDevboxList", null, regionUrl);
      }
      return devboxAction(
        urls.list,
        transformDevboxList,
        createDevboxFetchOptions("GET"),
        false,
        "getDevboxList"
      );
    },
    [devboxAction, setApiData, regionUrl]
  );

  const fetchDevboxReadyStatus = useCallback(
    async (devboxName: string) => {
      const urls = buildDevboxUrls();
      return devboxAction(
        urls.checkReady,
        transformCheckReady,
        createDevboxFetchOptions("GET", { devboxName }),
        false,
        `checkReady-${devboxName}`
      );
    },
    [devboxAction]
  );

  const startDevbox = useCallback(
    async (devboxName: string) => {
      const urls = buildDevboxUrls();
      return devboxAction(
        urls.start,
        transformStartDevbox,
        createDevboxPostFetchOptions({ devboxName }),
        true
      );
    },
    [devboxAction]
  );

  const shutdownDevbox = useCallback(
    async (devboxName: string, shutdownMode: ShutdownModeType = "Stopped") => {
      const urls = buildDevboxUrls();
      return devboxAction(
        urls.shutdown,
        transformShutdownDevbox,
        createDevboxPostFetchOptions({ devboxName, shutdownMode }),
        true
      );
    },
    [devboxAction]
  );

  const restartDevbox = useCallback(
    async (devboxName: string) => {
      const urls = buildDevboxUrls();
      return devboxAction(
        urls.restart,
        transformRestartDevbox,
        createDevboxPostFetchOptions({ devboxName }),
        true
      );
    },
    [devboxAction]
  );

  const createDevbox = useCallback(
    async (data: any) => {
      const urls = buildDevboxUrls();
      return devboxAction(
        urls.create,
        transformCreateDevbox,
        createDevboxPostFetchOptions(data),
        true
      );
    },
    [devboxAction]
  );

  const deleteDevbox = useCallback(
    async (devboxName: string) => {
      const urls = buildDevboxUrls();
      return devboxAction(
        urls.delete,
        transformDelDevbox,
        createDevboxPostFetchOptions({ devboxName }),
        true
      );
    },
    [devboxAction]
  );

  const updateDevbox = useCallback(
    async (data: any) => {
      const urls = buildDevboxUrls();
      return devboxAction(
        urls.update,
        transformUpdateDevbox,
        createDevboxPostFetchOptions(data),
        true
      );
    },
    [devboxAction]
  );

  const getDevboxByName = useCallback(
    async (devboxName: string) => {
      const urls = buildDevboxUrls();
      return devboxAction(
        urls.byName,
        transformDevboxByName,
        createDevboxFetchOptions("GET", { devboxName }),
        false,
        `getDevboxByName-${devboxName}`
      );
    },
    [devboxAction]
  );

  const getSSHConnectionInfo = useCallback(
    async (devboxName: string) => {
      const urls = buildDevboxUrls();
      return devboxAction(
        urls.sshInfo,
        transformSSHConnectionInfo,
        createDevboxFetchOptions("GET", { devboxName }),
        false,
        `getSSHConnectionInfo-${devboxName}`
      );
    },
    [devboxAction]
  );

  const genericDevboxAction = useCallback(
    (
      endpoint: keyof Omit<
        ReturnType<typeof buildDevboxUrls>,
        | "templateRepo"
        | "list"
        | "byName"
        | "sshInfo"
        | "checkReady"
        | "start"
        | "shutdown"
        | "restart"
        | "create"
        | "delete"
        | "update"
      >,
      transformation: (data: any) => any,
      isPost: boolean = false,
      invalidateList: boolean = false
    ) => {
      return async (data: any) => {
        const urls = buildDevboxUrls();
        const url = urls[endpoint] as string;
        const options = isPost
          ? createDevboxPostFetchOptions(data)
          : createDevboxFetchOptions("GET", data);
        return devboxAction(url, transformation, options, invalidateList);
      };
    },
    [devboxAction]
  );

  const genericTemplateRepoAction = useCallback(
    (
      endpoint: keyof ReturnType<typeof buildDevboxUrls>["templateRepo"],
      transformation: (data: any) => any,
      isPost: boolean = false,
      invalidateList: boolean = false
    ) => {
      return async (data: any) => {
        const urls = buildDevboxUrls();
        // This is tricky because the endpoint can be nested.
        let url: string;
        if (typeof urls.templateRepo[endpoint] === "string") {
          url = urls.templateRepo[endpoint] as string;
        } else {
          // This part is not robust and assumes a certain structure
          // It needs to be fixed if the structure is deeper or different.
          console.error(
            "Nested template repo URLs are not handled generically yet."
          );
          return;
        }

        const options = isPost
          ? createDevboxPostFetchOptions(data)
          : createDevboxFetchOptions("GET", data);
        return devboxAction(url, transformation, options, invalidateList);
      };
    },
    [devboxAction]
  );

  const delDevboxVersionByName = useCallback(
    genericDevboxAction(
      "delDevboxVersionByName",
      transformDelDevboxVersionByName,
      true,
      true
    ),
    [genericDevboxAction]
  );
  const editDevboxVersion = useCallback(
    genericDevboxAction(
      "editDevboxVersion",
      transformEditDevboxVersion,
      true,
      true
    ),
    [genericDevboxAction]
  );
  const execCommandInDevboxPod = useCallback(
    genericDevboxAction("exec", transformExecCommandInDevboxPod, true),
    [genericDevboxAction]
  );
  const getAppsByDevboxId = useCallback(
    genericDevboxAction("getApps", transformGetAppsByDevboxId),
    [genericDevboxAction]
  );
  const getDevboxPodsByDevboxName = useCallback(
    genericDevboxAction("getPods", transformGetDevboxPodsByDevboxName),
    [genericDevboxAction]
  );
  const getDevboxVersionList = useCallback(
    genericDevboxAction("getVersionList", transformGetDevboxVersionList),
    [genericDevboxAction]
  );
  const getEnv = useCallback(genericDevboxAction("getEnv", transformGetEnv), [
    genericDevboxAction,
  ]);
  const releaseDevbox = useCallback(
    genericDevboxAction("release", transformReleaseDevbox, true, true),
    [genericDevboxAction]
  );

  const templateRepositoryDelete = useCallback(
    genericTemplateRepoAction(
      "delete",
      transformTemplateRepositoryDelete,
      true,
      true
    ),
    [genericTemplateRepoAction]
  );
  const templateRepositoryGet = useCallback(
    genericTemplateRepoAction("get", transformTemplateRepositoryGet),
    [genericTemplateRepoAction]
  );
  const templateRepositoryList = useCallback(
    genericTemplateRepoAction("list", transformTemplateRepositoryList),
    [genericTemplateRepoAction]
  );
  const templateRepositoryListOfficial = useCallback(
    genericTemplateRepoAction(
      "listOfficial",
      transformTemplateRepositoryListOfficial
    ),
    [genericTemplateRepoAction]
  );
  const templateRepositoryListPrivate = useCallback(
    genericTemplateRepoAction(
      "listPrivate",
      transformTemplateRepositoryListPrivate
    ),
    [genericTemplateRepoAction]
  );
  const templateRepositoryUpdate = useCallback(
    genericTemplateRepoAction(
      "update",
      transformTemplateRepositoryUpdate,
      true,
      true
    ),
    [genericTemplateRepoAction]
  );
  // How to handle nested ones?
  // I will just implement them manually for now.
  const listTags = useCallback(
    async (data: any) => {
      const urls = buildDevboxUrls();
      return devboxAction(
        urls.templateRepo.tag.list,
        transformTemplateRepositoryTagList,
        createDevboxFetchOptions("GET", data)
      );
    },
    [devboxAction]
  );

  const deleteTemplate = useCallback(
    async (data: any) => {
      const urls = buildDevboxUrls();
      return devboxAction(
        urls.templateRepo.template.delete,
        transformTemplateRepositoryTemplateDelete,
        createDevboxPostFetchOptions(data),
        true
      );
    },
    [devboxAction]
  );

  const getTemplateConfig = useCallback(
    async (data: any) => {
      const urls = buildDevboxUrls();
      return devboxAction(
        urls.templateRepo.template.getConfig,
        transformTemplateRepositoryTemplateGetConfig,
        createDevboxFetchOptions("GET", data)
      );
    },
    [devboxAction]
  );

  const listTemplates = useCallback(
    async (data: any) => {
      const urls = buildDevboxUrls();
      return devboxAction(
        urls.templateRepo.template.list,
        transformTemplateRepositoryTemplateList,
        createDevboxFetchOptions("GET", data)
      );
    },
    [devboxAction]
  );

  const createWithTemplate = useCallback(
    async (data: any) => {
      const urls = buildDevboxUrls();
      return devboxAction(
        urls.templateRepo.withTemplate.create,
        transformTemplateRepositoryWithTemplateCreate,
        createDevboxPostFetchOptions(data),
        true
      );
    },
    [devboxAction]
  );

  const updateWithTemplate = useCallback(
    async (data: any) => {
      const urls = buildDevboxUrls();
      return devboxAction(
        urls.templateRepo.withTemplate.update,
        transformTemplateRepositoryWithTemplateUpdate,
        createDevboxPostFetchOptions(data),
        true
      );
    },
    [devboxAction]
  );

  // Platform API functions
  const platformAction = useCallback(
    async (
      endpoint: keyof ReturnType<typeof buildPlatformUrls>,
      transformation: (data: any) => any,
      isPost: boolean = false,
      data?: any
    ) => {
      try {
        const user = currentUser || (await getCurrentUser());
        if (!user) {
          throw new Error("No user found");
        }
        const currentRegionUrl = regionUrl;

        if (!hasRequiredTokens("devbox")) {
          throw new Error(
            "User missing required tokens for platform operations"
          );
        }

        const urls = buildPlatformUrls();
        const url = urls[endpoint];

        const [result] = await runWake({
          urls: [url],
          transformations: [transformation],
          fetchOptions: {
            method: isPost ? "POST" : "GET",
            params: { regionUrl: currentRegionUrl },
            ...(isPost && data ? { data } : {}),
          },
          context: {
            authorization:
              user.tokens?.find((t) => t.type === "kubeconfig")?.value || "",
          },
        });

        return result;
      } catch (error) {
        console.error(
          `Error performing platform action for ${endpoint}:`,
          error
        );
        throw error;
      }
    },
    [currentUser, regionUrl, hasRequiredTokens]
  );

  const authCname = useCallback(
    async (data: { publicDomain: string; customDomain: string }) => {
      return platformAction(
        "authCname",
        transformPlatformAuthCname,
        true,
        data
      );
    },
    [platformAction]
  );

  const getDebt = useCallback(async () => {
    return platformAction("getDebt", transformPlatformGetDebt);
  }, [platformAction]);

  const getQuota = useCallback(async () => {
    return platformAction("getQuota", transformPlatformGetQuota);
  }, [platformAction]);

  const getResourcePrice = useCallback(async () => {
    return platformAction("resourcePrice", transformPlatformResourcePrice);
  }, [platformAction]);

  return {
    currentUser,
    regionUrl,
    fetchDevboxList,
    fetchDevboxReadyStatus,
    startDevbox,
    shutdownDevbox,
    restartDevbox,
    createDevbox,
    deleteDevbox,
    updateDevbox,
    getDevboxByName,
    getSSHConnectionInfo,
    delDevboxVersionByName,
    editDevboxVersion,
    execCommandInDevboxPod,
    getAppsByDevboxId,
    getDevboxPodsByDevboxName,
    getDevboxVersionList,
    getEnv,
    releaseDevbox,
    templateRepositoryDelete,
    templateRepositoryGet,
    templateRepositoryList,
    templateRepositoryListOfficial,
    templateRepositoryListPrivate,
    templateRepositoryUpdate,
    listTags,
    deleteTemplate,
    getTemplateConfig,
    listTemplates,
    createWithTemplate,
    updateWithTemplate,
    // Platform API functions
    authCname,
    getDebt,
    getQuota,
    getResourcePrice,
    hasRequiredTokens: (type: "devbox" | "account") => hasRequiredTokens(type),
    getCachedDevboxList: (regionUrl: string) =>
      getApiData("devbox", "getDevboxList", regionUrl),
    isDevboxListValid: (regionUrl: string) =>
      isApiDataValid("devbox", "getDevboxList", regionUrl),
  };
}
