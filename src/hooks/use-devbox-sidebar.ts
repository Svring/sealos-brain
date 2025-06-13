import { useCallback, useState } from "react";
import { z } from "zod";
import { useSealosDevbox } from "@/hooks/use-sealos-devbox";
import {
  DevboxSchema,
  TemplateSchema,
} from "@/lib/devbox/schemas/devbox-list-schema";

// Type representing a simplified DevBox for sidebar usage
export interface SidebarDevboxItem {
  name: string;
  namespace: string;
  state: string;
  phase: string;
}

interface UseDevboxSidebarReturn {
  devboxes: SidebarDevboxItem[];
  rawData: any[] | null;
  loading: boolean;
  error: string | null;
  refresh: (force?: boolean) => Promise<void>;
}

/**
 * A thin wrapper around `useSealosDevbox` that normalises the data shape that
 * the sidebar actually needs, while keeping loading / error state local to the
 * consuming component. This means `AppSidebar` no longer has to worry about
 * parsing or caching details – it simply displays the result.
 */
export function useDevboxSidebar(): UseDevboxSidebarReturn {
  const [rawData, setRawData] = useState<any[] | null>(null);
  const [devboxes, setDevboxes] = useState<SidebarDevboxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { fetchDevboxList, getCachedDevboxList, isDevboxListValid, regionUrl } =
    useSealosDevbox();

  // ---------------- Helpers ----------------
  const parseDevboxData = (data: any[]) => {
    const parsed: SidebarDevboxItem[] = [];

    data.forEach((pair: any) => {
      type DevboxType = z.infer<typeof DevboxSchema>;
      type TemplateType = z.infer<typeof TemplateSchema>;

      const isDevbox = (item: any): item is DevboxType =>
        item && item.kind === "Devbox";
      const isTemplate = (item: any): item is TemplateType =>
        item && "templateRepository" in item;

      const devbox = pair.find(isDevbox);
      const template = pair.find(isTemplate);

      if (devbox && template) {
        parsed.push({
          name: devbox.metadata.name,
          namespace: devbox.metadata.namespace,
          state: devbox.spec.state,
          phase: devbox.status.phase,
        });
      }
    });

    setDevboxes(parsed);
  };

  // ---------------- Public API ----------------
  const refresh = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        // Prefer cached data if valid and not forcing refresh
        if (!forceRefresh) {
          const cached = getCachedDevboxList(regionUrl);
          if (cached && isDevboxListValid(regionUrl)) {
            setRawData(cached);
            parseDevboxData(cached);
            return;
          }
        }

        // Fetch fresh data
        const data = await fetchDevboxList(forceRefresh);
        setRawData(data);
        parseDevboxData(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
        setDevboxes([]);
      } finally {
        setLoading(false);
      }
    },
    [fetchDevboxList, getCachedDevboxList, isDevboxListValid, regionUrl]
  );

  return {
    devboxes,
    rawData,
    loading,
    error,
    refresh,
  };
}

export type DevboxWithTemplate = {
  // ... existing code ...
};
