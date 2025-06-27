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
 * Transform getDevboxByName response to extract preview and galatea addresses
 * Returns URLs for port 3000 (preview) and port 3051 (galatea)
 */
export const transformDevboxAddresses = (data: any) => {
  if (!(data?.networks && Array.isArray(data.networks))) {
    return {
      error: "Devbox is not controlled - no network information available",
    };
  }

  const previewNetwork = data.networks.find(
    (network: any) => network.port === 3000
  );
  const galateaNetwork = data.networks.find(
    (network: any) => network.port === 3051
  );

  if (!(previewNetwork?.publicDomain && galateaNetwork?.publicDomain)) {
    return {
      error:
        "Devbox is not controlled - required ports (3000, 3051) or their public domains are not available",
    };
  }

  return {
    preview_address: `https://${previewNetwork.publicDomain}`,
    galatea_address: `https://${galateaNetwork.publicDomain}`,
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
