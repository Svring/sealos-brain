"use server";

import { User } from "@/payload-types";

// Types for the devbox API
interface DevboxListRequest {
  region_url: string;
}

interface DevboxListResponse {
  data: any; // You can define a more specific type based on your devbox data structure
}

interface DevboxByNameRequest {
  region_url: string;
  devbox_name: string;
  mock?: boolean;
}

interface SSHConnectionInfoRequest {
  region_url: string;
  devbox_name: string;
}

interface CheckReadyRequest {
  region_url: string;
  devbox_name: string;
}

interface DevboxResponse {
  data: any;
}

/**
 * Fetch the list of devboxes from the backend API
 *
 * @param region_url - The region URL
 * @param kubeconfig - The kubeconfig token
 * @param devbox_token - The devbox token
 * @returns Promise<any> - The devbox list data
 */
export async function getDevboxList(
  region_url: string,
  kubeconfig: string,
  devbox_token: string
): Promise<any> {
  try {
    // Get backend URL from environment
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error("BACKEND_URL environment variable is not set");
    }

    // Prepare request data
    const requestData: DevboxListRequest = {
      region_url: region_url,
    };

    // Make API request to backend
    const response = await fetch(`${backendUrl}/devbox/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: kubeconfig,
        "Authorization-Bearer": devbox_token,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }

    const result: DevboxListResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching devbox list:", error);
    throw error;
  }
}

/**
 * Get devbox token from user tokens array (internal helper)
 *
 * @param user - The authenticated user
 * @param tokenType - The type of token to retrieve
 * @returns string | null - The token value or null if not found
 */
function getUserTokenInternal(
  user: User,
  tokenType: "kubeconfig" | "region_token" | "app_token" | "custom"
): string | null {
  return user.tokens?.find((token) => token.type === tokenType)?.value || null;
}

/**
 * Get devbox token from user tokens array (Server Action)
 *
 * @param user - The authenticated user
 * @param tokenType - The type of token to retrieve
 * @returns Promise<string | null> - The token value or null if not found
 */
export async function getUserToken(
  user: User,
  tokenType: "kubeconfig" | "region_token" | "app_token" | "custom"
): Promise<string | null> {
  return getUserTokenInternal(user, tokenType);
}

/**
 * Check if user has all required tokens for devbox operations (Server Action)
 *
 * @param user - The authenticated user
 * @returns Promise<boolean> - True if user has all required tokens
 */
export async function hasRequiredDevboxTokens(user: User): Promise<boolean> {
  const kubeconfig = getUserTokenInternal(user, "kubeconfig");
  const devboxToken = getUserTokenInternal(user, "app_token");

  return !!(kubeconfig && devboxToken);
}

/**
 * Get a specific devbox by name from the backend API
 *
 * @param region_url - The region URL
 * @param devbox_name - The name of the devbox
 * @param kubeconfig - The kubeconfig token
 * @param devbox_token - The devbox token
 * @param mock - Optional mock parameter
 * @returns Promise<any> - The devbox data
 */
export async function getDevboxByName(
  region_url: string,
  devbox_name: string,
  kubeconfig: string,
  devbox_token: string,
  mock?: boolean
): Promise<any> {
  try {
    // Get backend URL from environment
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error("BACKEND_URL environment variable is not set");
    }

    // Prepare request data
    const requestData: DevboxByNameRequest = {
      region_url: region_url,
      devbox_name: devbox_name,
      ...(mock !== undefined && { mock }),
    };

    // Make API request to backend
    const response = await fetch(`${backendUrl}/devbox/by-name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: kubeconfig,
        "Authorization-Bearer": devbox_token,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }

    const result: DevboxResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching devbox by name:", error);
    throw error;
  }
}

/**
 * Get SSH connection info for a specific devbox from the backend API
 *
 * @param region_url - The region URL
 * @param devbox_name - The name of the devbox
 * @param kubeconfig - The kubeconfig token
 * @param devbox_token - The devbox token
 * @returns Promise<any> - The SSH connection info
 */
export async function getSSHConnectionInfo(
  region_url: string,
  devbox_name: string,
  kubeconfig: string,
  devbox_token: string
): Promise<any> {
  try {
    // Get backend URL from environment
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error("BACKEND_URL environment variable is not set");
    }

    // Prepare request data
    const requestData: SSHConnectionInfoRequest = {
      region_url: region_url,
      devbox_name: devbox_name,
    };

    // Make API request to backend
    const response = await fetch(`${backendUrl}/devbox/ssh-connection-info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: kubeconfig,
        "Authorization-Bearer": devbox_token,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }

    const result: DevboxResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching SSH connection info:", error);
    throw error;
  }
}

/**
 * Check if a devbox is ready from the backend API
 *
 * @param region_url - The region URL
 * @param devbox_name - The name of the devbox
 * @param kubeconfig - The kubeconfig token
 * @param devbox_token - The devbox token
 * @returns Promise<any> - The ready status data
 */
export async function checkDevboxReady(
  region_url: string,
  devbox_name: string,
  kubeconfig: string,
  devbox_token: string
): Promise<any> {
  try {
    // Get backend URL from environment
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error("BACKEND_URL environment variable is not set");
    }

    // Prepare request data
    const requestData: CheckReadyRequest = {
      region_url: region_url,
      devbox_name: devbox_name,
    };

    // Make API request to backend
    const response = await fetch(`${backendUrl}/devbox/check-ready`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: kubeconfig,
        "Authorization-Bearer": devbox_token,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }

    const result: DevboxResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error checking devbox ready status:", error);
    throw error;
  }
}
