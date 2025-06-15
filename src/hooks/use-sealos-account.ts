import { useCallback } from "react";
import { useSealosStore } from "@/store/sealos-store";
import { getCurrentUser } from "@/database/actions/user-actions";
import { createAccountContext } from "@/lib/account/account-provider";
import {
  buildAccountUrls,
  createAccountFetchOptions,
  createAccountApiContext,
  transformAccountAmount,
} from "@/lib/account/account-utils";
import { runWake } from "@/lib/wake";

export function useSealosAccount() {
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
          const cachedAmount = getApiData(
            "account",
            "getAmount",
            currentRegionUrl
          );
          if (
            cachedAmount &&
            isApiDataValid("account", "getAmount", currentRegionUrl)
          ) {
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
            regionUrl: currentRegionUrl,
          }),
          context: apiContext,
        });

        // Cache the fetched data
        setApiData("account", "getAmount", amountData, currentRegionUrl);

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
      getApiData,
      setApiData,
      isApiDataValid,
      hasRequiredTokens,
    ]
  );

  return {
    currentUser,
    regionUrl,
    fetchAccountAmount,
    hasRequiredTokens: useCallback(
      (type: "devbox" | "account") => hasRequiredTokens(type),
      [hasRequiredTokens]
    ),
    getCachedAccountAmount: useCallback(
      (regionUrl: string) => getApiData("account", "getAmount", regionUrl),
      [getApiData]
    ),
    isAccountDataValid: useCallback(
      (regionUrl: string) => isApiDataValid("account", "getAmount", regionUrl),
      [isApiDataValid]
    ),
  };
}
