import { useCallback } from "react";
import { useSealosStore } from "@/store/sealos-store";
import { getCurrentUser } from "@/database/actions/user-actions";
import { createAccountContext } from "@/provider/account/account-provider";
import {
  buildAccountUrls,
  createAccountFetchOptions,
  createAccountApiContext,
  transformAccountAmount,
  transformAuthInfo,
} from "@/provider/account/account-utils";
import { runWake } from "@/lib/wake";

export function useSealosAccount() {
  const {
    currentUser,
    regionUrl,
    setCurrentUser,
    setRegionUrl,
    getAccountAmount,
    setAccountAmount,
    getAuthInfo,
    setAuthInfo,
    isAccountDataValid,
    hasRequiredTokens,
  } = useSealosStore();

  const fetchAccountAmount = useCallback(
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
          const cachedAmount = getAccountAmount(currentRegionUrl);
          if (cachedAmount && isAccountDataValid(currentRegionUrl)) {
            console.log("Using cached account amount data");
            return cachedAmount;
          }
        }

        // Check if user has required tokens
        if (!hasRequiredTokens("account")) {
          throw new Error(
            "User missing required tokens for account operations"
          );
        }

        console.log("Fetching fresh account amount data");

        const accountContext = await createAccountContext(
          user,
          currentRegionUrl
        );
        if (!accountContext) {
          throw new Error("Failed to create account context - missing tokens");
        }

        const urls = buildAccountUrls();
        const apiContext = createAccountApiContext(accountContext);

        const [amountData] = await runWake({
          urls: [urls.getAmount],
          transformations: [transformAccountAmount],
          fetchOptions: createAccountFetchOptions("GET", {
            region_url: currentRegionUrl,
          }),
          context: apiContext,
        });

        // Cache the fetched data
        setAccountAmount(amountData, currentRegionUrl);

        return amountData;
      } catch (error) {
        console.error("Error fetching account amount:", error);
        throw error;
      }
    },
    [
      currentUser,
      regionUrl,
      setCurrentUser,
      setRegionUrl,
      getAccountAmount,
      setAccountAmount,
      isAccountDataValid,
      hasRequiredTokens,
    ]
  );

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
          const cachedAuthInfo = getAuthInfo(currentRegionUrl);
          if (cachedAuthInfo && isAccountDataValid(currentRegionUrl)) {
            console.log("Using cached auth info data");
            return cachedAuthInfo;
          }
        }

        // Check if user has required tokens
        if (!hasRequiredTokens("account")) {
          throw new Error(
            "User missing required tokens for account operations"
          );
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
        setAuthInfo(authInfoData, currentRegionUrl);

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
      getAuthInfo,
      setAuthInfo,
      isAccountDataValid,
      hasRequiredTokens,
    ]
  );

  return {
    currentUser,
    regionUrl,
    fetchAccountAmount,
    fetchAuthInfo,
    hasRequiredTokens: (type: "devbox" | "account") => hasRequiredTokens(type),
    getCachedAccountAmount: (regionUrl: string) => getAccountAmount(regionUrl),
    getCachedAuthInfo: (regionUrl: string) => getAuthInfo(regionUrl),
    isAccountDataValid: (regionUrl: string) => isAccountDataValid(regionUrl),
  };
}
