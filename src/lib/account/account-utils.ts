// Types for better type safety
export interface AccountContext {
  regionToken: string;
  regionUrl: string;
}

/**
 * Build local API paths for account operations
 */
export function buildAccountUrls() {
  return {
    getAmount: "/api/sealos/account/getAmount",
    authInfo: "/api/sealos/auth/info",
  };
}

// Data transformation functions
/**
 * Transform raw account amount response
 */
export const transformAccountAmount = (rawData: any) => {
  try {
    const { balance, deductionBalance } = rawData.data;
    const validBalanceRaw = balance - deductionBalance;
    // Keep only the first three digits
    const validBalance = Number(validBalanceRaw.toString().slice(0, 3));
    return {
      balance,
      deductionBalance,
      validBalance,
    };
  } catch (error) {
    console.error("Error parsing account amount data:", error);
    throw new Error("Invalid account amount data format");
  }
};

/**
 * Transform raw auth info response
 */
export const transformAuthInfo = (rawData: any) => {
  try {
    return rawData.data; // Add specific transformation if needed
  } catch (error) {
    console.error("Error parsing auth info data:", error);
    throw new Error("Invalid auth info data format");
  }
};

/**
 * Create fetch options for account API calls (GET requests with query params)
 */
export function createAccountFetchOptions(method: "GET" = "GET", params?: any) {
  return {
    method,
    params,
    headers: {
      "Content-Type": "application/json",
    },
  };
}

/**
 * Create context for account API calls
 */
export function createAccountApiContext(accountContext: AccountContext) {
  return {
    Authorization: accountContext.regionToken,
  };
}
