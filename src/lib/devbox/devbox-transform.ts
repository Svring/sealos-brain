import { z } from "zod";
import {
  DataSchema,
  DevboxSchema,
  TemplateSchema as DevboxTemplateSchema,
} from "./schemas/devbox-list-schema";
import { TemplateRepositoryListSchema } from "./schemas/template-repo-schema";
import { DataSchema as TemplateListDataSchema } from "./schemas/template-list-schema";

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
