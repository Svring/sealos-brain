import type {
  DataSchema,
  DevboxSchema,
  TemplateSchema as DevboxTemplateSchema,
} from "./schemas/devbox-list-schema";
import { DataSchema as TemplateListDataSchema } from "./schemas/template-list-schema";
import { TemplateRepositoryListSchema } from "./schemas/template-repo-schema";

export interface DevboxNodeDisplayData extends Record<string, unknown> {
  id: string;
  state: "Running" | "Stopped" | "Unknown" | "Creating";
  iconId?: string;
  devboxName: string;
}

/**
 * Helper function to determine devbox state from spec or status
 */
const getDevboxState = (
  devbox: DevboxSchema
): "Running" | "Stopped" | "Unknown" => {
  if (devbox.spec?.state) {
    if (devbox.spec.state === "Running") {
      return "Running";
    }
    if (devbox.spec.state === "Stopped") {
      return "Stopped";
    }
    return "Unknown";
  }

  if (devbox.status?.phase) {
    if (devbox.status.phase === "Running") {
      return "Running";
    }
    if (devbox.status.phase === "Stopped") {
      return "Stopped";
    }
    return "Unknown";
  }

  return "Unknown";
};

/**
 * Transform devbox list into lightweight node display data
 * Only includes data needed for node rendering
 */
export const transformDevboxListIntoNode = (
  data: DataSchema
): DevboxNodeDisplayData[] => {
  return data
    .map((pair): DevboxNodeDisplayData | null => {
      // Find the devbox and template from the pair
      const devbox = pair.find((item: any) => item.kind === "Devbox") as
        | DevboxSchema
        | undefined;

      const templateInfo = pair.find(
        (item: any) => "templateRepository" in item
      ) as DevboxTemplateSchema | undefined;

      if (!devbox) return null;

      const devboxName = devbox.metadata.name;
      const state = getDevboxState(devbox);

      return {
        id: `devbox-${devboxName}`,
        state,
        iconId: templateInfo?.templateRepository?.iconId,
        devboxName,
      };
    })
    .filter((item): item is DevboxNodeDisplayData => item !== null);
};

/**
 * Transform template repository API response into flat array of repositories
 * Extracts templateRepositoryList from the nested API response structure
 */
export const transformTemplateRepositoryList = (data: any) => {
  const validatedResponse = TemplateRepositoryListSchema.parse(data);
  return validatedResponse.templateRepositoryList;
};

/**
 * Transform template list API response into flat array of templates
 * Extracts templateList from the nested API response structure
 */
export const transformTemplateList = (data: any) => {
  try {
    const validatedResponse = TemplateListDataSchema.parse(data);
    return validatedResponse.templateList;
  } catch (error) {
    console.error("Failed to transform template list data:", error);
    console.error("Raw data:", data);

    // Fallback: try to extract array directly if validation fails
    if (data?.templateList && Array.isArray(data.templateList)) {
      return data.templateList;
    }

    // Return empty array as fallback
    return [];
  }
};

/**
 * Transform getDevboxByName response to extract devpod and preview addresses
 * Returns URLs for specified ports (default: 3051 for devpod, 3000 for preview)
 */
export const transformDevboxAddresses = (
  data: unknown,
  devpodPort = 3051,
  previewPort = 3000
): { devpod_address: string; preview_address: string } | { error: string } => {
  if (
    !data ||
    typeof data !== "object" ||
    !("networks" in data) ||
    !Array.isArray(data.networks)
  ) {
    return {
      error: "Devbox is not controlled - no network information available",
    };
  }

  const networks = data.networks as Array<{
    port: number;
    publicDomain?: string;
    [key: string]: unknown;
  }>;

  const previewNetwork = networks.find(
    (network) => network.port === previewPort
  );
  const devpodNetwork = networks.find((network) => network.port === devpodPort);

  if (!(previewNetwork?.publicDomain && devpodNetwork?.publicDomain)) {
    return {
      error: `Devbox is not controlled - required ports (${previewPort}, ${devpodPort}) or their public domains are not available`,
    };
  }

  return {
    preview_address: `https://${previewNetwork.publicDomain}`,
    devpod_address: `https://${devpodNetwork.publicDomain}`,
  };
};

/**
 * Transform devbox list API response into flat array of devbox names
 */
export const transformDevboxListToNames = (data: DataSchema): string[] => {
  return data
    .map((pair) => {
      const devbox = pair.find((item: any) => item.kind === "Devbox") as
        | DevboxSchema
        | undefined;
      return devbox?.metadata.name;
    })
    .filter(
      (name): name is string => typeof name === "string" && name.length > 0
    );
};

/**
 * Transform devbox list into table data format
 * Converts API response to format expected by the DevboxColumn schema
 */
export const transformDevboxListToTable = (data: DataSchema) => {
  return data
    .map((pair) => {
      const devbox = pair.find((item: any) => item.kind === "Devbox") as
        | DevboxSchema
        | undefined;

      const templateInfo = pair.find(
        (item: any) => "templateRepository" in item
      ) as DevboxTemplateSchema | undefined;

      if (!devbox) return null;

      const devboxName = devbox.metadata.name;

      // Determine status from devbox spec or status
      let status = "Unknown";
      if (devbox.spec?.state) {
        status = devbox.spec.state;
      } else if (devbox.status?.phase) {
        status = devbox.status.phase;
      }

      // Format creation timestamp
      const createdAt = new Date(
        devbox.metadata.creationTimestamp
      ).toLocaleDateString();

      // Calculate estimated cost (placeholder - you may want to implement real cost calculation)
      const cpu = devbox.spec?.resource?.cpu || "0";
      const memory = devbox.spec?.resource?.memory || "0";
      const cost = `$${(Number.parseFloat(cpu.replace(/[^0-9.]/g, "")) * 0.001 + Number.parseFloat(memory.replace(/[^0-9.]/g, "")) * 0.0001).toFixed(2)}/day`;

      return {
        id: `devbox-${devboxName}`,
        name: devboxName,
        status,
        createdAt,
        cost,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
};

/**
 * Transform getDevboxByName response to extract just the networks array
 * Returns array of network configurations including ports, domains, etc.
 */
export const transformDevboxNetworks = (data: any) => {
  if (!(data?.networks && Array.isArray(data.networks))) {
    return [];
  }

  return data.networks.map((network: any) => ({
    portName: network.portName,
    port: network.port,
    protocol: network.protocol,
    networkName: network.networkName,
    openPublicDomain: network.openPublicDomain,
    publicDomain: network.publicDomain,
    customDomain: network.customDomain,
  }));
};
