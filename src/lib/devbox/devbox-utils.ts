import { z } from "zod";
import {
  DataSchema,
  DevboxSchema,
  TemplateSchema as DevboxTemplateSchema,
} from "./schemas/devbox-list-schema";
import {
  ServiceDataSchema,
  ServiceSchema,
} from "./schemas/devbox-check-ready-schema";
import { ResponseSchema as TemplateRepositoryListSchema } from "./schemas/template-repo-schema";
import { ResponseSchema as TemplateListSchema } from "./schemas/template-list-schema";

// Types for better type safety
export interface DevboxContext {
  kubeconfig: string;
  devboxToken: string;
  regionUrl: string;
}

// Interface for lightweight node display data (only what's needed for rendering)
export interface DevboxNodeDisplayData extends Record<string, unknown> {
  id: string;
  name: string;
  state: "Running" | "Stopped" | "Unknown";
  iconId?: string;
  url?: string;
  devboxName: string; // Add this for store lookup
}

// Interface for full devbox data (used by detail components)
export interface DevboxFullData {
  devbox: z.infer<typeof DevboxSchema>;
  readyData?: z.infer<typeof ServiceSchema>;
  templateInfo?: z.infer<typeof DevboxTemplateSchema>;
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
    start: "/api/sealos/devbox/startDevbox",
    shutdown: "/api/sealos/devbox/shutdownDevbox",
    restart: "/api/sealos/devbox/restartDevbox",
    create: "/api/sealos/devbox/createDevbox",
    delete: "/api/sealos/devbox/delDevbox",
    delDevboxVersionByName: "/api/sealos/devbox/delDevboxVersionByName",
    editDevboxVersion: "/api/sealos/devbox/editDevboxVersion",
    exec: "/api/sealos/devbox/execCommandInDevboxPod",
    getApps: "/api/sealos/devbox/getAppsByDevboxId",
    getPods: "/api/sealos/devbox/getDevboxPodsByDevboxName",
    getVersionList: "/api/sealos/devbox/getDevboxVersionList",
    getEnv: "/api/sealos/devbox/getEnv",
    release: "/api/sealos/devbox/releaseDevbox",
    update: "/api/sealos/devbox/updateDevbox",
    templateRepo: {
      delete: "/api/sealos/devbox/templateRepository/delete",
      get: "/api/sealos/devbox/templateRepository/get",
      list: "/api/sealos/devbox/templateRepository/list",
      listOfficial: "/api/sealos/devbox/templateRepository/listOfficial",
      listPrivate: "/api/sealos/devbox/templateRepository/listPrivate",
      update: "/api/sealos/devbox/templateRepository/update",
      tag: {
        list: "/api/sealos/devbox/templateRepository/tag/list",
      },
      template: {
        delete: "/api/sealos/devbox/templateRepository/template/delete",
        getConfig: "/api/sealos/devbox/templateRepository/template/getConfig",
        list: "/api/sealos/devbox/templateRepository/template/list",
      },
      withTemplate: {
        create: "/api/sealos/devbox/templateRepository/withTemplate/create",
        update: "/api/sealos/devbox/templateRepository/withTemplate/update",
      },
    },
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

/**
 * Build local API paths for platform operations
 */
export function buildPlatformUrls() {
  return {
    authCname: "/api/sealos/devbox/platform/authCname",
    getDebt: "/api/sealos/devbox/platform/getDebt",
    getQuota: "/api/sealos/devbox/platform/getQuota",
    resourcePrice: "/api/sealos/devbox/platform/resourcePrice",
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
 * Transform devbox list into lightweight node display data
 * Only includes data needed for node rendering
 */
export const transformDevboxListIntoNode = (
  parsedData: z.infer<typeof DataSchema>,
  readyDataMap: Map<string, z.infer<typeof ServiceSchema>> = new Map()
): DevboxNodeDisplayData[] => {
  return parsedData
    .map((pair): DevboxNodeDisplayData | null => {
      // Find the devbox and template from the pair
      const devbox = pair.find((item: any) => item.kind === "Devbox") as
        | z.infer<typeof DevboxSchema>
        | undefined;

      const templateInfo = pair.find(
        (item: any) => "templateRepository" in item
      ) as z.infer<typeof DevboxTemplateSchema> | undefined;

      if (!devbox) return null;

      const devboxName = devbox.metadata.name;
      const readyData = readyDataMap.get(devboxName);

      // Determine state from devbox spec or status
      let state: "Running" | "Stopped" | "Unknown" = "Unknown";
      if (devbox.spec?.state) {
        state =
          devbox.spec.state === "Running"
            ? "Running"
            : devbox.spec.state === "Stopped"
              ? "Stopped"
              : "Unknown";
      } else if (devbox.status?.phase) {
        state =
          devbox.status.phase === "Running"
            ? "Running"
            : devbox.status.phase === "Stopped"
              ? "Stopped"
              : "Unknown";
      }

      return {
        id: `devbox-${devboxName}`,
        name: devboxName,
        state,
        iconId: templateInfo?.templateRepository?.iconId,
        url:
          Array.isArray(readyData) && readyData.length > 0
            ? readyData[0].url
            : undefined,
        devboxName, // Store the name for lookup
      };
    })
    .filter((item): item is DevboxNodeDisplayData => item !== null);
};

/**
 * Create a map of devbox data for efficient lookup by name
 */
export const createDevboxDataMap = (
  parsedData: z.infer<typeof DataSchema>,
  readyDataMap: Map<string, z.infer<typeof ServiceSchema>> = new Map()
): Map<string, DevboxFullData> => {
  const dataMap = new Map<string, DevboxFullData>();

  parsedData.forEach((pair) => {
    const devbox = pair.find((item: any) => item.kind === "Devbox") as
      | z.infer<typeof DevboxSchema>
      | undefined;

    const templateInfo = pair.find(
      (item: any) => "templateRepository" in item
    ) as z.infer<typeof DevboxTemplateSchema> | undefined;

    if (devbox) {
      const devboxName = devbox.metadata.name;
      const readyData = readyDataMap.get(devboxName);

      dataMap.set(devboxName, {
        devbox,
        readyData,
        templateInfo,
      });
    }
  });

  return dataMap;
};

/**
 * Transform devbox list into lightweight node data for React Flow
 */
export const transformToNodeData = (
  parsedData: z.infer<typeof DataSchema>,
  readyDataMap: Map<string, any> = new Map()
) => {
  const lightweightData = transformDevboxListIntoNode(parsedData, readyDataMap);

  return lightweightData.map((item, index) => ({
    id: item.id,
    type: "devbox",
    position: { x: 300 + index * 280, y: 200 },
    data: item, // Only lightweight display data
  }));
};

/**
 * Transform start devbox response
 */
export const transformStartDevbox = (rawData: any) => {
  try {
    return rawData; // Add specific transformation if needed
  } catch (error) {
    console.error("Error parsing start devbox data:", error);
    throw new Error("Invalid start devbox data format");
  }
};

/**
 * Transform shutdown devbox response
 */
export const transformShutdownDevbox = (rawData: any) => {
  try {
    return rawData; // Add specific transformation if needed
  } catch (error) {
    console.error("Error parsing shutdown devbox data:", error);
    throw new Error("Invalid shutdown devbox data format");
  }
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
 * Create fetch options for devbox POST API calls with data payload
 */
export function createDevboxPostFetchOptions(data: any, params?: any) {
  return {
    method: "POST" as const,
    data,
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

// New transform functions
export const transformCreateDevbox = (rawData: any) => rawData;
export const transformDelDevbox = (rawData: any) => rawData;
export const transformDelDevboxVersionByName = (rawData: any) => rawData;
export const transformEditDevboxVersion = (rawData: any) => rawData;
export const transformExecCommandInDevboxPod = (rawData: any) => rawData;
export const transformGetAppsByDevboxId = (rawData: any) => rawData;
export const transformGetDevboxPodsByDevboxName = (rawData: any) => rawData;
export const transformGetDevboxVersionList = (rawData: any) => rawData;
export const transformGetEnv = (rawData: any) => rawData;
export const transformReleaseDevbox = (rawData: any) => rawData;
export const transformRestartDevbox = (rawData: any) => rawData;
export const transformUpdateDevbox = (rawData: any) => rawData;
export const transformTemplateRepositoryDelete = (rawData: any) => rawData;
export const transformTemplateRepositoryGet = (rawData: any) => rawData;
export const transformTemplateRepositoryList = (rawData: any) => rawData;
export const transformTemplateRepositoryListOfficial = (rawData: any) => {
  try {
    const parsedData = TemplateRepositoryListSchema.parse(rawData);
    return parsedData.data.templateRepositoryList;
  } catch (error) {
    console.error("Error parsing template repository list data:", error);
    throw new Error("Invalid template repository list data format");
  }
};
export const transformTemplateRepositoryListPrivate = (rawData: any) => rawData;
export const transformTemplateRepositoryTagList = (rawData: any) => rawData;
export const transformTemplateRepositoryTemplateDelete = (rawData: any) =>
  rawData;
export const transformTemplateRepositoryTemplateGetConfig = (rawData: any) =>
  rawData;
export const transformTemplateRepositoryTemplateList = (rawData: any) => {
  try {
    const parsedData = TemplateListSchema.parse(rawData);
    return parsedData.data.templateList;
  } catch (error) {
    console.error("Error parsing template list data:", error);
    throw new Error("Invalid template list data format");
  }
};
export const transformTemplateRepositoryUpdate = (rawData: any) => rawData;
export const transformTemplateRepositoryWithTemplateCreate = (rawData: any) =>
  rawData;
export const transformTemplateRepositoryWithTemplateUpdate = (rawData: any) =>
  rawData;

// Platform API transformation functions
export const transformPlatformAuthCname = (rawData: any) => rawData;
export const transformPlatformGetDebt = (rawData: any) => rawData;
export const transformPlatformGetQuota = (rawData: any) => rawData;
export const transformPlatformResourcePrice = (rawData: any) => rawData;
