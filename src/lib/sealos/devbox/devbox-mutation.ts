import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import type { User } from "@/payload-types";
import { generateDevboxFormFromTemplate } from "./devbox-utils";

interface DevboxData {
  devboxForm?: {
    name?: string;
  };
  name?: string;
}

interface DevboxResult {
  devboxName: string;
  templateName?: string;
}

interface ShutdownResult {
  devboxName: string;
  action: string;
}

interface BulkOperationResult<T = unknown> {
  success: boolean;
  item: string;
  result?: T;
  error?: string;
}

// Helper to get headers from currentUser
function getDevboxHeaders(currentUser: User | null) {
  return {
    Authorization:
      currentUser?.tokens?.find((t) => t.type === "kubeconfig")?.value || "",
    "Authorization-Bearer":
      currentUser?.tokens?.find((t) => t.type === "custom")?.value || "",
  };
}

// Start Devbox
export function startDevboxMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (devboxName: string) => {
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/devbox/startDevbox?regionUrl=${regionUrl}`,
        { devboxName },
        { headers }
      );
      return { ...response.data, devboxName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
      toast.success(`Devbox '${data.devboxName}' is successfully started`);
    },
    onError: (error: Error, devboxName) => {
      toast.error(`Failed to start devbox '${devboxName}': ${error.message}`);
    },
  });
}

// Shutdown Devbox
export function shutdownDevboxMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      devboxName,
      shutdownMode,
    }: {
      devboxName: string;
      shutdownMode: "Stopped" | "Shutdown";
    }) => {
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/devbox/shutdownDevbox?regionUrl=${regionUrl}`,
        { devboxName, shutdownMode },
        { headers }
      );
      return { ...response.data, devboxName, shutdownMode };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
      const action = data.shutdownMode === "Stopped" ? "stopped" : "shutdown";
      toast.success(`Devbox '${data.devboxName}' is successfully ${action}`);
    },
    onError: (error: Error, variables) => {
      const action = variables.shutdownMode === "Stopped" ? "stop" : "shutdown";
      toast.error(
        `Failed to ${action} devbox '${variables.devboxName}': ${error.message}`
      );
    },
  });
}

// Restart Devbox
export function restartDevboxMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (devboxName: string) => {
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/devbox/restartDevbox?regionUrl=${regionUrl}`,
        { devboxName },
        { headers }
      );
      return { ...response.data, devboxName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
      toast.success(`Devbox '${data.devboxName}' is successfully restarted`);
    },
    onError: (error: Error, devboxName) => {
      toast.error(`Failed to restart devbox '${devboxName}': ${error.message}`);
    },
  });
}

// Delete Devbox
export function deleteDevboxMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (devboxName: string) => {
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.delete(
        `/api/sealos/devbox/delDevbox?regionUrl=${regionUrl}&devboxName=${devboxName}`,
        { headers }
      );
      return { ...response.data, devboxName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
      toast.success(`Devbox '${data.devboxName}' is successfully deleted`);
    },
    onError: (error: Error, devboxName) => {
      toast.error(`Failed to delete devbox '${devboxName}': ${error.message}`);
    },
  });
}

// Create Devbox
export function createDevboxMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (devboxData: DevboxData) => {
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/devbox/createDevbox?regionUrl=${regionUrl}`,
        devboxData,
        { headers }
      );
      // Extract devbox name from the request data
      const devboxName =
        devboxData.devboxForm?.name || devboxData.name || "Unknown";
      return { ...response.data, devboxName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
      toast.success(`Devbox '${data.devboxName}' is successfully created`);
    },
    onError: (error: Error, devboxData) => {
      const devboxName =
        devboxData.devboxForm?.name || devboxData.name || "Unknown";
      toast.error(`Failed to create devbox '${devboxName}': ${error.message}`);
    },
  });
}

// Release Devbox
export function releaseDevboxMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      devboxName,
      devboxUid,
      tag,
      releaseDes,
    }: {
      devboxName: string;
      devboxUid: string;
      tag: string | number;
      releaseDes: string;
    }) => {
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/devbox/releaseDevbox?regionUrl=${regionUrl}`,
        { devboxName, devboxUid, tag, releaseDes },
        { headers }
      );
      return { ...response.data, devboxName, tag };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
      queryClient.invalidateQueries({ queryKey: ["devbox", "versions"] });
      toast.success(
        `Devbox '${data.devboxName}' version '${data.tag}' is successfully released`
      );
    },
    onError: (error: Error, variables) => {
      toast.error(
        `Failed to release devbox '${variables.devboxName}': ${error.message}`
      );
    },
  });
}

// Delete Devbox Version
export function deleteDevboxVersionMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (versionName: string) => {
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.delete(
        `/api/sealos/devbox/delDevboxVersionByName?regionUrl=${regionUrl}&versionName=${versionName}`,
        { headers }
      );
      return { ...response.data, versionName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["devbox", "versions"] });
      toast.success(
        `Devbox version '${data.versionName}' is successfully deleted`
      );
    },
    onError: (error: Error, versionName) => {
      toast.error(
        `Failed to delete devbox version '${versionName}': ${error.message}`
      );
    },
  });
}

// Create Devbox from Template Name
export function createDevboxFromTemplateMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (templateName: string) => {
      if (!regionUrl) {
        throw new Error("Region URL is required");
      }

      // First, generate the devboxForm from template name
      const devboxForm = await generateDevboxFormFromTemplate(
        templateName,
        currentUser,
        regionUrl
      );

      // Then, create the devbox using the generated form
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/devbox/createDevbox?regionUrl=${regionUrl}`,
        { devboxForm },
        { headers }
      );

      return { ...response.data, devboxName: devboxForm.name, templateName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
      toast.success(
        `Devbox '${data.devboxName}' is successfully created from template '${data.templateName}'`
      );
    },
    onError: (error: Error, templateName) => {
      toast.error(
        `Failed to create devbox from template '${templateName}': ${error.message}`
      );
    },
  });
}

/**
 * Create multiple devboxes from templates concurrently
 */
export async function createMultipleDevboxes(
  templates: string[],
  currentUser: User | null,
  regionUrl: string | undefined
): Promise<{
  successful: BulkOperationResult<DevboxResult>[];
  failed: BulkOperationResult[];
  summary: string;
}> {
  const results = await Promise.all(
    templates.map(async (template) => {
      try {
        if (!regionUrl) {
          throw new Error("Region URL is required");
        }

        // First, generate the devboxForm from template name
        const devboxForm = await generateDevboxFormFromTemplate(
          template,
          currentUser,
          regionUrl
        );

        // Then, create the devbox using the generated form
        const headers = getDevboxHeaders(currentUser);
        const response = await axios.post(
          `/api/sealos/devbox/createDevbox?regionUrl=${regionUrl}`,
          { devboxForm },
          { headers }
        );

        const result = {
          ...response.data,
          devboxName: devboxForm.name,
          templateName: template,
        };

        return {
          success: true,
          item: template,
          result: {
            devboxName: result.devboxName,
            templateName: result.templateName || template,
          },
        } as BulkOperationResult<DevboxResult>;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        return {
          success: false,
          item: template,
          error: errorMessage,
        } as BulkOperationResult;
      }
    })
  );

  const successful = results.filter(
    (r): r is BulkOperationResult<DevboxResult> => r.success
  );
  const failed = results.filter((r) => !r.success);

  let summary = "";
  if (successful.length > 0) {
    summary += `Successfully created ${successful.length} devbox(es):\n`;
    for (const r of successful) {
      summary += `- '${r.result?.devboxName}' from template '${r.result?.templateName}'\n`;
    }
  }
  if (failed.length > 0) {
    summary += `\nFailed to create ${failed.length} devbox(es):\n`;
    for (const r of failed) {
      summary += `- Template '${r.item}': ${r.error}\n`;
    }
  }

  return { successful, failed, summary: summary.trim() };
}

/**
 * Delete multiple devboxes concurrently
 */
export async function deleteMultipleDevboxes(
  devboxNames: string[],
  currentUser: User | null,
  regionUrl: string | undefined
): Promise<{
  successful: BulkOperationResult[];
  failed: BulkOperationResult[];
  summary: string;
}> {
  const results = await Promise.all(
    devboxNames.map(async (name) => {
      try {
        const headers = getDevboxHeaders(currentUser);
        const response = await axios.delete(
          `/api/sealos/devbox/delDevbox?regionUrl=${regionUrl}&devboxName=${name}`,
          { headers }
        );

        const result = { ...response.data, devboxName: name };

        return {
          success: true,
          item: name,
          result: result.devboxName || name,
        } as BulkOperationResult;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        return {
          success: false,
          item: name,
          error: errorMessage,
        } as BulkOperationResult;
      }
    })
  );

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  let summary = "";
  if (successful.length > 0) {
    summary += `Successfully deleted ${successful.length} devbox(es):\n`;
    for (const r of successful) {
      summary += `- '${r.result}'\n`;
    }
  }
  if (failed.length > 0) {
    summary += `\nFailed to delete ${failed.length} devbox(es):\n`;
    for (const r of failed) {
      summary += `- '${r.item}': ${r.error}\n`;
    }
  }

  return { successful, failed, summary: summary.trim() };
}

/**
 * Start multiple devboxes concurrently
 */
export async function startMultipleDevboxes(
  devboxNames: string[],
  currentUser: User | null,
  regionUrl: string | undefined
): Promise<{
  successful: BulkOperationResult[];
  failed: BulkOperationResult[];
  summary: string;
}> {
  const results = await Promise.all(
    devboxNames.map(async (name) => {
      try {
        const headers = getDevboxHeaders(currentUser);
        const response = await axios.post(
          `/api/sealos/devbox/startDevbox?regionUrl=${regionUrl}`,
          { devboxName: name },
          { headers }
        );

        const result = { ...response.data, devboxName: name };

        return {
          success: true,
          item: name,
          result: result.devboxName || name,
        } as BulkOperationResult;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        return {
          success: false,
          item: name,
          error: errorMessage,
        } as BulkOperationResult;
      }
    })
  );

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  let summary = "";
  if (successful.length > 0) {
    summary += `Successfully started ${successful.length} devbox(es):\n`;
    for (const r of successful) {
      summary += `- '${r.result}'\n`;
    }
  }
  if (failed.length > 0) {
    summary += `\nFailed to start ${failed.length} devbox(es):\n`;
    for (const r of failed) {
      summary += `- '${r.item}': ${r.error}\n`;
    }
  }

  return { successful, failed, summary: summary.trim() };
}

/**
 * Shutdown multiple devboxes concurrently
 */
export async function shutdownMultipleDevboxes(
  devboxNames: string[],
  currentUser: User | null,
  regionUrl: string | undefined
): Promise<{
  successful: BulkOperationResult<ShutdownResult>[];
  failed: BulkOperationResult[];
  summary: string;
}> {
  const results = await Promise.all(
    devboxNames.map(async (name) => {
      try {
        const headers = getDevboxHeaders(currentUser);
        const response = await axios.post(
          `/api/sealos/devbox/shutdownDevbox?regionUrl=${regionUrl}`,
          { devboxName: name, shutdownMode: "Stopped" },
          { headers }
        );

        const result = {
          ...response.data,
          devboxName: name,
          shutdownMode: "Stopped",
        };
        const action =
          result.shutdownMode === "Stopped" ? "stopped" : "shutdown";

        return {
          success: true,
          item: name,
          result: { devboxName: result.devboxName || name, action },
        } as BulkOperationResult<ShutdownResult>;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        return {
          success: false,
          item: name,
          error: errorMessage,
        } as BulkOperationResult;
      }
    })
  );

  const successful = results.filter(
    (r): r is BulkOperationResult<ShutdownResult> => r.success
  );
  const failed = results.filter((r) => !r.success);

  let summary = "";
  if (successful.length > 0) {
    summary += `Successfully shutdown ${successful.length} devbox(es):\n`;
    for (const r of successful) {
      summary += `- '${r.result?.devboxName}' is successfully ${r.result?.action}\n`;
    }
  }
  if (failed.length > 0) {
    summary += `\nFailed to shutdown ${failed.length} devbox(es):\n`;
    for (const r of failed) {
      summary += `- '${r.item}': ${r.error}\n`;
    }
  }

  return { successful, failed, summary: summary.trim() };
}
