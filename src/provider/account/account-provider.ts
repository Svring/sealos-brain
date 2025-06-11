"use server";

import { User } from "@/payload-types";

// Types for better type safety
export interface AccountContext {
  regionToken: string;
  regionUrl: string;
}

export interface AccountAmountParams {
  region_url: string;
}

export interface AuthInfoParams {
  region_url: string;
}

/**
 * Get user token from user tokens array (internal helper)
 */
function getUserTokenInternal(
  user: User,
  tokenType: "kubeconfig" | "region_token" | "app_token" | "custom"
): string | null {
  return user.tokens?.find((token) => token.type === tokenType)?.value || null;
}

/**
 * Get user token from user tokens array (Server Action)
 */
export async function getUserToken(
  user: User,
  tokenType: "kubeconfig" | "region_token" | "app_token" | "custom"
): Promise<string | null> {
  return getUserTokenInternal(user, tokenType);
}

/**
 * Check if user has required tokens for account operations
 */
export async function hasRequiredAccountTokens(user: User): Promise<boolean> {
  const regionToken = getUserTokenInternal(user, "region_token");
  return !!regionToken;
}

/**
 * Create account context from user tokens
 */
export async function createAccountContext(
  user: User,
  regionUrl: string
): Promise<AccountContext | null> {
  const regionToken = await getUserToken(user, "region_token");

  if (!regionToken) {
    return null;
  }

  return {
    regionToken,
    regionUrl,
  };
}
