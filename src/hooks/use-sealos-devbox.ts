import { useCallback } from "react";
import { useSealosStore } from "@/store/sealos-store";
import { getCurrentUser } from "@/database/actions/user-actions";
import { createDevboxContext } from "@/provider/devbox/devbox-provider";
import {
  buildDevboxUrls,
  createDevboxFetchOptions,
  createDevboxApiContext,
  transformDevboxList,
  transformCheckReady,
} from "@/provider/devbox/devbox-utils";
import { runWake } from "@/lib/wake";

export function useSealosDevbox() {
  const {
    currentUser,
    regionUrl,
    setCurrentUser,
    setRegionUrl,
    getDevboxList,
    setDevboxList,
    isDevboxListValid,
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
          const cachedDevboxList = getDevboxList(currentRegionUrl);
          if (cachedDevboxList && isDevboxListValid(currentRegionUrl)) {
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
        setDevboxList(devboxListData, currentRegionUrl);

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
      getDevboxList,
      setDevboxList,
      isDevboxListValid,
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

  return {
    currentUser,
    regionUrl,
    fetchDevboxList,
    fetchDevboxReadyStatus,
    hasRequiredTokens: (type: "devbox" | "account") => hasRequiredTokens(type),
    getCachedDevboxList: (regionUrl: string) => getDevboxList(regionUrl),
    isDevboxListValid: (regionUrl: string) => isDevboxListValid(regionUrl),
  };
}
