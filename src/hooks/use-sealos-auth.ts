import { useCallback } from "react";
import { useSealosStore } from "@/store/sealos-store";
import { getCurrentUser } from "@/database/actions/user-actions";
import { createAccountContext } from "@/provider/account/account-provider";
import {
  buildAccountUrls,
  createAccountFetchOptions,
  createAccountApiContext,
  transformAuthInfo,
} from "@/provider/account/account-utils";
import { runWake } from "@/lib/wake";

export function useSealosAuth() {
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

  const fetchAuthInfo = useCallback(
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
          const cachedAuthInfo = getApiData("auth", "info", currentRegionUrl);
          if (
            cachedAuthInfo &&
            isApiDataValid("auth", "info", currentRegionUrl)
          ) {
            console.log("Using cached auth info data");
            return cachedAuthInfo;
          }
        }

        // Check if user has required tokens
        if (!hasRequiredTokens("account")) {
          throw new Error("User missing required tokens for auth operations");
        }

        console.log("Fetching fresh auth info data");

        const accountContext = await createAccountContext(
          user,
          currentRegionUrl
        );
        if (!accountContext) {
          throw new Error("Failed to create account context - missing tokens");
        }

        const urls = buildAccountUrls();
        const apiContext = createAccountApiContext(accountContext);

        const [authInfoData] = await runWake({
          urls: [urls.authInfo],
          transformations: [transformAuthInfo],
          fetchOptions: createAccountFetchOptions("GET", {
            region_url: currentRegionUrl,
          }),
          context: apiContext,
        });

        // Cache the fetched data
        setApiData("auth", "info", authInfoData, currentRegionUrl);

        return authInfoData;
      } catch (error) {
        console.error("Error fetching auth info:", error);
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

  return {
    currentUser,
    regionUrl,
    fetchAuthInfo,
    hasRequiredTokens: (type: "devbox" | "account") => hasRequiredTokens(type),
    getCachedAuthInfo: (regionUrl: string) =>
      getApiData("auth", "info", regionUrl),
    isAuthDataValid: (regionUrl: string) =>
      isApiDataValid("auth", "info", regionUrl),
  };
}
