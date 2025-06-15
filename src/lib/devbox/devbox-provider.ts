// "use server";

// import { User } from "@/payload-types";

// // Types for better type safety
// export interface DevboxContext {
//   kubeconfig: string;
//   devboxToken: string;
//   regionUrl: string;
// }

// export interface DevboxListParams {
//   region_url: string;
// }

// export interface DevboxByNameParams {
//   region_url: string;
//   devbox_name: string;
//   mock?: boolean;
// }

// export interface SSHConnectionParams {
//   region_url: string;
//   devbox_name: string;
// }

// export interface CheckReadyParams {
//   region_url: string;
//   devbox_name: string;
// }

// /**
//  * Get devbox token from user tokens array (internal helper)
//  */
// function getUserTokenInternal(
//   user: User,
//   tokenType: "kubeconfig" | "region_token" | "app_token" | "custom"
// ): string | null {
//   return user.tokens?.find((token) => token.type === tokenType)?.value || null;
// }

// /**
//  * Get devbox token from user tokens array (Server Action)
//  */
// export async function getUserToken(
//   user: User,
//   tokenType: "kubeconfig" | "region_token" | "app_token" | "custom"
// ): Promise<string | null> {
//   return getUserTokenInternal(user, tokenType);
// }

// /**
//  * Check if user has all required tokens for devbox operations
//  */
// export async function hasRequiredDevboxTokens(user: User): Promise<boolean> {
//   const kubeconfig = getUserTokenInternal(user, "kubeconfig");
//   const devboxToken = getUserTokenInternal(user, "custom");
//   return !!(kubeconfig && devboxToken);
// }

// /**
//  * Create devbox context from user tokens
//  */
// export async function createDevboxContext(
//   user: User,
//   regionUrl: string
// ): Promise<DevboxContext | null> {
//   const kubeconfig = await getUserToken(user, "kubeconfig");
//   const devboxToken = await getUserToken(user, "custom");

//   if (!kubeconfig || !devboxToken) {
//     return null;
//   }

//   return {
//     kubeconfig,
//     devboxToken,
//     regionUrl,
//   };
// }
