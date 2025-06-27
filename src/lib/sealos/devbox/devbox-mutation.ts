import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User } from "@/payload-types";
import {
  type BulkOperationResult,
  createDevbox,
  createDevboxFromTemplate,
  type DevboxData,
  type DevboxResult,
  deleteDevbox,
  processDevboxBulkResults,
  restartDevbox,
  type ShutdownResult,
  shutdownDevbox,
  startDevbox,
} from "./devbox-utils";

// Start Devbox Mutation
export function startDevboxMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (devboxName: string) => {
      if (!regionUrl) {
        throw new Error("Region URL is required");
      }
      return startDevbox(devboxName, currentUser, regionUrl);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
      toast.success(`Devbox '${data.devboxName}' is successfully started`);
    },
    onError: (error: Error, devboxName: string) => {
      toast.error(`Failed to start devbox '${devboxName}': ${error.message}`);
    },
  });
}

// Shutdown Devbox Mutation
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
      if (!regionUrl) {
        throw new Error("Region URL is required");
      }
      const result = await shutdownDevbox(
        devboxName,
        currentUser,
        regionUrl,
        shutdownMode
      );
      return result;
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

// Restart Devbox Mutation
export function restartDevboxMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (devboxName: string) => {
      if (!regionUrl) {
        throw new Error("Region URL is required");
      }
      return restartDevbox(devboxName, currentUser, regionUrl);
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

// Delete Devbox Mutation
export function deleteDevboxMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (devboxName: string) => {
      if (!regionUrl) {
        throw new Error("Region URL is required");
      }
      return deleteDevbox(devboxName, currentUser, regionUrl);
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

// Create Devbox Mutation
export function createDevboxMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (devboxData: DevboxData) => {
      if (!regionUrl) {
        throw new Error("Region URL is required");
      }
      return createDevbox(devboxData, currentUser, regionUrl);
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

// Create Devbox from Template Mutation
export function createDevboxFromTemplateMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateName: string) => {
      if (!regionUrl) {
        throw new Error("Region URL is required");
      }
      return createDevboxFromTemplate(templateName, currentUser, regionUrl);
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

        const result = await createDevboxFromTemplate(
          template,
          currentUser,
          regionUrl
        );

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

  return processDevboxBulkResults(results, "created");
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
        if (!regionUrl) {
          throw new Error("Region URL is required");
        }
        const result = await deleteDevbox(name, currentUser, regionUrl);
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

  return processDevboxBulkResults(results, "deleted");
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
        if (!regionUrl) {
          throw new Error("Region URL is required");
        }
        const result = await startDevbox(name, currentUser, regionUrl);
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

  return processDevboxBulkResults(results, "started");
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
        if (!regionUrl) {
          throw new Error("Region URL is required");
        }
        const result = await shutdownDevbox(name, currentUser, regionUrl);
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

  return processDevboxBulkResults(results, "shutdown");
}
