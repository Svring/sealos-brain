import { useCallback } from "react";
import { useSealosStore } from "@/store/sealos-store";
import { getCurrentUser } from "@/database/actions/user-actions";
import { createDevboxContext } from "@/provider/devbox/devbox-provider";
import {
  buildDevboxUrls,
  createDevboxFetchOptions,
  createDevboxPostFetchOptions,
  createDevboxApiContext,
  transformDevboxList,
  transformCheckReady,
  transformStartDevbox,
  transformShutdownDevbox,
} from "@/provider/devbox/devbox-utils";
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

  const fetchDevboxList = useCallback(
    async (forceRefresh = false) => {
      try {
        // Get current user if not in store
        let user = currentUser;
        if (!user) {
          user = await getCurrentUser();
          if (!user) {
            throw new Error("No user found");
          }
          setCurrentUser(user);
        }

        const currentRegionUrl = regionUrl;
        setRegionUrl(currentRegionUrl);

        // Check if we have valid cached data and not forcing refresh
        if (!forceRefresh) {
          const cachedDevboxList = getApiData(
            "devbox",
            "getDevboxList",
            currentRegionUrl
          );
          if (
            cachedDevboxList &&
            isApiDataValid("devbox", "getDevboxList", currentRegionUrl)
          ) {
            console.log("Using cached devbox data");
            return cachedDevboxList;
          }
        }

        // Check if user has required tokens
        if (!hasRequiredTokens("devbox")) {
          throw new Error("User missing required tokens for devbox operations");
        }

        console.log("Fetching fresh devbox data");

        const devboxContext = await createDevboxContext(user, currentRegionUrl);
        if (!devboxContext) {
          throw new Error("Failed to create devbox context - missing tokens");
        }

        const urls = buildDevboxUrls();
        const apiContext = createDevboxApiContext(devboxContext);

        const [devboxListData] = await runWake({
          urls: [urls.list],
          transformations: [transformDevboxList],
          fetchOptions: createDevboxFetchOptions("GET", {
            region_url: currentRegionUrl,
          }),
          context: apiContext,
        });

        // Cache the fetched data
        setApiData("devbox", "getDevboxList", devboxListData, currentRegionUrl);

        return devboxListData;
      } catch (error) {
        console.error("Error fetching devbox list:", error);
        throw error;
      }
    },
    [
      currentUser,
      regionUrl,
      setCurrentUser,
      setRegionUrl,
      getApiData,
      setApiData,
      isApiDataValid,
      hasRequiredTokens,
    ]
  );

  const fetchDevboxReadyStatus = useCallback(
    async (devboxName: string) => {
      try {
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

        const urls = buildDevboxUrls();
        const apiContext = createDevboxApiContext(devboxContext);

        const [readyData] = await runWake({
          urls: [urls.checkReady],
          transformations: [transformCheckReady],
          fetchOptions: createDevboxFetchOptions("GET", {
            region_url: currentRegionUrl,
            devbox_name: devboxName,
          }),
          context: apiContext,
        });

        return readyData;
      } catch (error) {
        console.error("Error fetching devbox ready status:", error);
        throw error;
      }
    },
    [currentUser, regionUrl, hasRequiredTokens]
  );

  const startDevbox = useCallback(
    async (devboxName: string) => {
      try {
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

        const urls = buildDevboxUrls();
        const apiContext = createDevboxApiContext(devboxContext);

        const [result] = await runWake({
          urls: [urls.start],
          transformations: [transformStartDevbox],
          fetchOptions: createDevboxPostFetchOptions(
            { devboxName },
            { region_url: currentRegionUrl }
          ),
          context: apiContext,
        });

        // Invalidate cached devbox list to force refresh
        setApiData("devbox", "getDevboxList", null, currentRegionUrl);

        return result;
      } catch (error) {
        console.error("Error starting devbox:", error);
        throw error;
      }
    },
    [currentUser, regionUrl, hasRequiredTokens, setApiData]
  );

  const shutdownDevbox = useCallback(
    async (devboxName: string, shutdownMode: ShutdownModeType = "Stopped") => {
      try {
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

        const urls = buildDevboxUrls();
        const apiContext = createDevboxApiContext(devboxContext);

        const [result] = await runWake({
          urls: [urls.shutdown],
          transformations: [transformShutdownDevbox],
          fetchOptions: createDevboxPostFetchOptions(
            { devboxName, shutdownMode },
            { region_url: currentRegionUrl }
          ),
          context: apiContext,
        });

        // Invalidate cached devbox list to force refresh
        setApiData("devbox", "getDevboxList", null, currentRegionUrl);

        return result;
      } catch (error) {
        console.error("Error shutting down devbox:", error);
        throw error;
      }
    },
    [currentUser, regionUrl, hasRequiredTokens, setApiData]
  );

  return {
    currentUser,
    regionUrl,
    fetchDevboxList,
    fetchDevboxReadyStatus,
    startDevbox,
    shutdownDevbox,
    hasRequiredTokens: (type: "devbox" | "account") => hasRequiredTokens(type),
    getCachedDevboxList: (regionUrl: string) =>
      getApiData("devbox", "getDevboxList", regionUrl),
    isDevboxListValid: (regionUrl: string) =>
      isApiDataValid("devbox", "getDevboxList", regionUrl),
  };
}
