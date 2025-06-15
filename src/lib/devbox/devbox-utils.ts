import { z } from "zod";
import {
  DataSchema,
  DevboxSchema,
  TemplateSchema as DevboxTemplateSchema,
} from "./schemas/devbox-list-schema";

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
