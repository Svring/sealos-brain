import { z } from "zod";
import { DataSchema, DevboxSchema } from "./schemas/devbox-list-schema";
import { ServiceDataSchema } from "./schemas/devbox-check-ready-schema";

// Types for better type safety
export interface DevboxContext {
  kubeconfig: string;
  devboxToken: string;
  regionUrl: string;
}

/**
 * Build local API paths for devbox operations
 */
export function buildDevboxUrls() {
  return {
    list: "/api/sealos/devbox/getDevboxList",
    byName: "/api/sealos/devbox/getDevboxByName",
    sshInfo: "/api/sealos/devbox/getSSHConnectionInfo",
    checkReady: "/api/sealos/devbox/checkReady",
  };
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
 * Transform raw devbox list response
 */
export const transformDevboxList = (rawData: any) => {
  try {
    return DataSchema.parse(rawData.data);
  } catch (error) {
    console.error("Error parsing devbox list data:", error);
    throw new Error("Invalid devbox list data format");
  }
};

/**
 * Transform raw devbox by name response
 */
export const transformDevboxByName = (rawData: any) => {
  try {
    return rawData; // Add specific transformation if needed
  } catch (error) {
    console.error("Error parsing devbox by name data:", error);
    throw new Error("Invalid devbox by name data format");
  }
};

/**
 * Transform raw SSH connection info response
 */
export const transformSSHConnectionInfo = (rawData: any) => {
  try {
    return rawData; // Add specific transformation if needed
  } catch (error) {
    console.error("Error parsing SSH connection info:", error);
    throw new Error("Invalid SSH connection info format");
  }
};

/**
 * Transform raw check ready response
 */
export const transformCheckReady = (rawData: any) => {
  try {
    return ServiceDataSchema.parse({ data: rawData.data }).data;
  } catch (error) {
    console.error("Error parsing check ready data:", error);
    throw new Error("Invalid check ready data format");
  }
};

/**
 * Transform account amount response
 */
export const transformAccountAmount = (rawData: any) => {
  try {
    return rawData; // Add specific transformation if needed
  } catch (error) {
    console.error("Error parsing account amount data:", error);
    throw new Error("Invalid account amount data format");
  }
};

/**
 * Transform auth info response
 */
export const transformAuthInfo = (rawData: any) => {
  try {
    return rawData; // Add specific transformation if needed
  } catch (error) {
    console.error("Error parsing auth info data:", error);
    throw new Error("Invalid auth info data format");
  }
};

/**
 * Transform devbox list into node data for React Flow
 */
export const transformToNodeData = (
  parsedData: z.infer<typeof DataSchema>,
  readyDataMap: Map<string, any> = new Map()
) => {
  return parsedData
    .map((pair, index) => {
      const devbox = pair.find((item: any) => item.kind === "Devbox") as
        | z.infer<typeof DevboxSchema>
        | undefined;

      if (!devbox) return null;

      const readyData = readyDataMap.get(devbox.metadata.name) || null;
      const templateInfo = pair.find(
        (item: any) => "templateRepository" in item
      );

      return {
        id: `devbox-${devbox.metadata.name}`,
        type: "devbox",
        position: { x: 300 + index * 280, y: 200 },
        data: {
          devbox,
          readyData,
          templateInfo,
        },
      };
    })
    .filter(Boolean);
};

/**
 * Create fetch options for devbox API calls (GET requests with query params)
 */
export function createDevboxFetchOptions(method: "GET" = "GET", params?: any) {
  return {
    method,
    params,
    headers: {
      "Content-Type": "application/json",
    },
  };
}

/**
 * Create context for devbox API calls
 */
export function createDevboxApiContext(devboxContext: DevboxContext) {
  return {
    Authorization: devboxContext.kubeconfig,
    "Authorization-Bearer": devboxContext.devboxToken,
  };
}

/**
 * Create context for account API calls
 */
export function createAccountApiContext(devboxContext: DevboxContext) {
  return {
    Authorization: devboxContext.kubeconfig,
  };
}
