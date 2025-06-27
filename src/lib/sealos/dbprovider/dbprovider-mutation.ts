import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import type { User } from "@/payload-types";
import { getDBTypeByName } from "./dbprovider-utils";

interface BulkOperationResult<T = unknown> {
  success: boolean;
  item: string;
  result?: T;
  error?: string;
}

interface DBFormData {
  dbName?: string;
  name?: string;
  dbType?: string;
  [key: string]: unknown;
}

// Helper to get headers from currentUser
function getDBProviderHeaders(currentUser: User | null) {
  return {
    Authorization:
      currentUser?.tokens?.find((t) => t.type === "kubeconfig")?.value || "",
  };
}

// Start Database
export function startDBByNameMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dbName: string) => {
      if (!regionUrl) {
        throw new Error("Region URL is required");
      }

      // Automatically determine the database type
      const dbType = await getDBTypeByName(dbName, currentUser, regionUrl);

      const headers = getDBProviderHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/dbprovider/startDBByName?regionUrl=${regionUrl}`,
        { dbName, dbType },
        { headers }
      );
      return { ...response.data, dbName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dbprovider", "list"] });
      toast.success(`Database '${data.dbName}' is successfully started`);
    },
    onError: (error: Error, dbName) => {
      toast.error(`Failed to start database '${dbName}': ${error.message}`);
    },
  });
}

// Pause Database
export function pauseDBByNameMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dbName: string) => {
      if (!regionUrl) {
        throw new Error("Region URL is required");
      }

      // Automatically determine the database type
      const dbType = await getDBTypeByName(dbName, currentUser, regionUrl);

      const headers = getDBProviderHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/dbprovider/pauseDBByName?regionUrl=${regionUrl}`,
        { dbName, dbType },
        { headers }
      );
      return { ...response.data, dbName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dbprovider", "list"] });
      toast.success(`Database '${data.dbName}' is successfully paused`);
    },
    onError: (error: Error, dbName) => {
      toast.error(`Failed to pause database '${dbName}': ${error.message}`);
    },
  });
}

// Delete Database
export function delDBByNameMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dbName: string) => {
      const headers = getDBProviderHeaders(currentUser);
      const response = await axios.delete(
        `/api/sealos/dbprovider/delDBByName?regionUrl=${regionUrl}&name=${dbName}`,
        { headers }
      );
      return { ...response.data, dbName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dbprovider", "list"] });
      toast.success(`Database '${data.dbName}' is successfully deleted`);
    },
    onError: (error: Error, dbName) => {
      toast.error(`Failed to delete database '${dbName}': ${error.message}`);
    },
  });
}

// Create Database
export function createDBMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dbFormData: DBFormData) => {
      if (!regionUrl) {
        throw new Error("Region URL is required");
      }
      const headers = getDBProviderHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/dbprovider/createDB?regionUrl=${regionUrl}`,
        dbFormData,
        { headers }
      );
      // Extract database name from form data
      const dbName = dbFormData.dbName || dbFormData.name || "Unknown";
      const dbType = dbFormData.dbType || "database";
      return { ...response.data, dbName, dbType };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dbprovider", "list"] });
      toast.success(
        `Database '${data.dbName}' (${data.dbType}) is successfully created`
      );
    },
    onError: (error: Error, dbFormData) => {
      const dbName = dbFormData.dbName || dbFormData.name || "Unknown";
      toast.error(`Failed to create database '${dbName}': ${error.message}`);
    },
  });
}

/**
 * Start multiple databases concurrently
 */
export async function startMultipleDBs(
  dbNames: string[],
  currentUser: User | null,
  regionUrl: string | undefined
): Promise<{
  successful: BulkOperationResult[];
  failed: BulkOperationResult[];
  summary: string;
}> {
  const results = await Promise.all(
    dbNames.map(async (name) => {
      try {
        if (!regionUrl) {
          throw new Error("Region URL is required");
        }

        const dbType = await getDBTypeByName(name, currentUser, regionUrl);

        const headers = getDBProviderHeaders(currentUser);
        const response = await axios.post(
          `/api/sealos/dbprovider/startDBByName?regionUrl=${regionUrl}`,
          { dbName: name, dbType },
          { headers }
        );

        const result = { ...response.data, dbName: name };

        return {
          success: true,
          item: name,
          result: result.dbName || name,
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
    summary += `Successfully started ${successful.length} database(s):
`;
    for (const r of successful) {
      summary += `- '${r.result}'
`;
    }
  }
  if (failed.length > 0) {
    summary += `
Failed to start ${failed.length} database(s):
`;
    for (const r of failed) {
      summary += `- '${r.item}': ${r.error}
`;
    }
  }

  return { successful, failed, summary: summary.trim() };
}

/**
 * Pause multiple databases concurrently
 */
export async function pauseMultipleDBs(
  dbNames: string[],
  currentUser: User | null,
  regionUrl: string | undefined
): Promise<{
  successful: BulkOperationResult[];
  failed: BulkOperationResult[];
  summary: string;
}> {
  const results = await Promise.all(
    dbNames.map(async (name) => {
      try {
        if (!regionUrl) {
          throw new Error("Region URL is required");
        }

        const dbType = await getDBTypeByName(name, currentUser, regionUrl);

        const headers = getDBProviderHeaders(currentUser);
        const response = await axios.post(
          `/api/sealos/dbprovider/pauseDBByName?regionUrl=${regionUrl}`,
          { dbName: name, dbType },
          { headers }
        );

        const result = { ...response.data, dbName: name };

        return {
          success: true,
          item: name,
          result: result.dbName || name,
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
    summary += `Successfully paused ${successful.length} database(s):
`;
    for (const r of successful) {
      summary += `- '${r.result}'
`;
    }
  }
  if (failed.length > 0) {
    summary += `
Failed to pause ${failed.length} database(s):
`;
    for (const r of failed) {
      summary += `- '${r.item}': ${r.error}
`;
    }
  }

  return { successful, failed, summary: summary.trim() };
}

/**
 * Delete multiple databases concurrently
 */
export async function deleteMultipleDBs(
  dbNames: string[],
  currentUser: User | null,
  regionUrl: string | undefined
): Promise<{
  successful: BulkOperationResult[];
  failed: BulkOperationResult[];
  summary: string;
}> {
  const results = await Promise.all(
    dbNames.map(async (name) => {
      try {
        const headers = getDBProviderHeaders(currentUser);
        const response = await axios.delete(
          `/api/sealos/dbprovider/delDBByName?regionUrl=${regionUrl}&name=${name}`,
          { headers }
        );

        const result = { ...response.data, dbName: name };

        return {
          success: true,
          item: name,
          result: result.dbName || name,
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
    summary += `Successfully deleted ${successful.length} database(s):
`;
    for (const r of successful) {
      summary += `- '${r.result}'
`;
    }
  }
  if (failed.length > 0) {
    summary += `
Failed to delete ${failed.length} database(s):
`;
    for (const r of failed) {
      summary += `- '${r.item}': ${r.error}
`;
    }
  }

  return { successful, failed, summary: summary.trim() };
}

/**
 * Create multiple databases concurrently
 */
export async function createMultipleDBs(
  dbForms: DBFormData[],
  currentUser: User | null,
  regionUrl: string | undefined
): Promise<{
  successful: BulkOperationResult[];
  failed: BulkOperationResult[];
  summary: string;
}> {
  const results = await Promise.all(
    dbForms.map(async (dbFormData) => {
      try {
        if (!regionUrl) {
          throw new Error("Region URL is required");
        }
        const headers = getDBProviderHeaders(currentUser);
        const response = await axios.post(
          `/api/sealos/dbprovider/createDB?regionUrl=${regionUrl}`,
          dbFormData,
          { headers }
        );
        const dbName = dbFormData.dbName || dbFormData.name || "Unknown";
        const dbType = dbFormData.dbType || "database";
        const result = { ...response.data, dbName, dbType };

        return {
          success: true,
          item: dbName,
          result: result.dbName || dbName,
        } as BulkOperationResult;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        const dbName = dbFormData.dbName || dbFormData.name || "Unknown";
        return {
          success: false,
          item: dbName,
          error: errorMessage,
        } as BulkOperationResult;
      }
    })
  );

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  let summary = "";
  if (successful.length > 0) {
    summary += `Successfully created ${successful.length} database(s):
`;
    for (const r of successful) {
      summary += `- '${r.result}'
`;
    }
  }
  if (failed.length > 0) {
    summary += `
Failed to create ${failed.length} database(s):
`;
    for (const r of failed) {
      summary += `- '${r.item}': ${r.error}
`;
    }
  }

  return { successful, failed, summary: summary.trim() };
}
