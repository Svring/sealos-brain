import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User } from "@/payload-types";
import {
  type BulkOperationResult,
  createDatabase,
  type DBFormData,
  deleteDatabase,
  pauseDatabase,
  processBulkOperationResults,
  startDatabase,
} from "./dbprovider-utils";

// Start Database Mutation
export function startDBByNameMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dbName: string) => {
      if (!regionUrl) {
        throw new Error("Region URL is required");
      }
      return startDatabase(dbName, currentUser, regionUrl);
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

// Pause Database Mutation
export function pauseDBByNameMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dbName: string) => {
      if (!regionUrl) {
        throw new Error("Region URL is required");
      }
      return pauseDatabase(dbName, currentUser, regionUrl);
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

// Delete Database Mutation
export function delDBByNameMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dbName: string) => {
      if (!regionUrl) {
        throw new Error("Region URL is required");
      }
      return deleteDatabase(dbName, currentUser, regionUrl);
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

// Create Database Mutation
export function createDBMutation(
  currentUser: User | null,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dbFormData: DBFormData) => {
      if (!regionUrl) {
        throw new Error("Region URL is required");
      }
      return createDatabase(dbFormData, currentUser, regionUrl);
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
        const result = await startDatabase(name, currentUser, regionUrl);
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

  return processBulkOperationResults(results, "started");
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
        const result = await pauseDatabase(name, currentUser, regionUrl);
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

  return processBulkOperationResults(results, "paused");
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
        if (!regionUrl) {
          throw new Error("Region URL is required");
        }
        const result = await deleteDatabase(name, currentUser, regionUrl);
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

  return processBulkOperationResults(results, "deleted");
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
        const result = await createDatabase(dbFormData, currentUser, regionUrl);
        const dbName = dbFormData.dbName || dbFormData.name || "Unknown";
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

  return processBulkOperationResults(results, "created");
}
