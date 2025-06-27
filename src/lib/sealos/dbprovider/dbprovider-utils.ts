import axios from "axios";
import { customAlphabet } from "nanoid";
import type { User } from "@/payload-types";
import { DB_TYPE_VERSION_MAP } from "./dbprovider-constant";

// Create a custom nanoid with lowercase alphabet and size 12
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz", 12);

// Regex patterns defined at top level for performance
const DB_NAME_REGEX = /^[a-z0-9-]+$/;
const OPERATION_NAME_REGEX = /ed$/;

interface DBResponse {
  dbType?: string;
}

// Helper to get headers from currentUser
function getDBProviderHeaders(currentUser: User | null) {
  return {
    Authorization:
      currentUser?.tokens?.find((t) => t.type === "kubeconfig")?.value || "",
  };
}

/**
 * Get database type by database name
 * @param dbName - The name of the database
 * @param currentUser - Current user object with authentication tokens
 * @param regionUrl - The region URL for the API
 * @returns Promise<string> - The database type (e.g., "postgresql", "mongodb", etc.)
 */
export async function getDBTypeByName(
  dbName: string,
  currentUser: User | null,
  regionUrl: string
): Promise<string> {
  if (!(dbName && currentUser && regionUrl)) {
    throw new Error(
      "Missing required parameters: dbName, currentUser, or regionUrl"
    );
  }

  try {
    const headers = getDBProviderHeaders(currentUser);
    const response = await axios.get<DBResponse>(
      `/api/sealos/dbprovider/getDBByName?regionUrl=${regionUrl}&name=${dbName}`,
      { headers }
    );

    // Extract dbType from the response data
    const dbType = response?.data?.dbType;

    if (!dbType) {
      throw new Error(`Database type not found for database: ${dbName}`);
    }

    return dbType;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(
      `Failed to get database type for ${dbName}: ${errorMessage}`
    );
  }
}

/**
 * Get the first version id for a given dbType
 * @param dbType - The database type (e.g., "postgresql", "mongodb")
 * @returns The first version id as a string, or undefined if not found
 */
export function getFirstDBVersion(dbType: string): string | undefined {
  const versions =
    DB_TYPE_VERSION_MAP[dbType as keyof typeof DB_TYPE_VERSION_MAP];
  if (Array.isArray(versions) && versions.length > 0 && versions[0]) {
    return versions[0].id;
  }
  return;
}

/**
 * Generate a dbForm object for a given dbType with sensible defaults
 * @param dbType - The database type (e.g., "kafka", "postgresql")
 * @returns An object with dbForm and isEdit: false
 */
export function generateDBFormFromType(dbType: string) {
  const dbVersion = getFirstDBVersion(dbType);
  const dbName = `db-${nanoid()}`;

  return {
    dbForm: {
      dbType,
      dbVersion,
      dbName,
      replicas: 1,
      cpu: 2000,
      memory: 2048,
      storage: 4,
      labels: {},
      autoBackup: {
        start: true,
        type: "day",
        week: [],
        hour: "23",
        minute: "00",
        saveTime: 7,
        saveType: "d",
      },
      terminationPolicy: "Delete",
    },
    isEdit: false,
  };
}

/**
 * Validate database names (basic validation)
 */
export function validateDBNames(names: (string | undefined)[]): {
  isValid: boolean;
  invalidNames: string[];
} {
  const validNames = names.filter((n): n is string => Boolean(n));
  const invalidNames = validNames.filter(
    (name) => !name || name.trim().length === 0 || !DB_NAME_REGEX.test(name)
  );

  return {
    isValid: invalidNames.length === 0,
    invalidNames,
  };
}

/**
 * Validate database types against allowed types
 */
export function validateDBTypes(
  types: (string | undefined)[],
  allowedTypes: string[]
): {
  isValid: boolean;
  invalidTypes: string[];
} {
  const validTypes = types.filter((t): t is string => Boolean(t));
  const invalidTypes = validTypes.filter(
    (type) => !allowedTypes.includes(type)
  );

  return {
    isValid: invalidTypes.length === 0,
    invalidTypes,
  };
}

// Interfaces for database operations
export interface DBFormData {
  dbName?: string;
  name?: string;
  dbType?: string;
  [key: string]: unknown;
}

export interface BulkOperationResult<T = unknown> {
  success: boolean;
  item: string;
  result?: T;
  error?: string;
}

// Export the headers function for use in mutations
export { getDBProviderHeaders };

/**
 * Core function to start a database
 */
export async function startDatabase(
  dbName: string,
  currentUser: User | null,
  regionUrl: string
): Promise<{ dbName: string }> {
  if (!regionUrl) {
    throw new Error("Region URL is required");
  }

  const dbType = await getDBTypeByName(dbName, currentUser, regionUrl);
  const headers = getDBProviderHeaders(currentUser);

  const response = await axios.post(
    `/api/sealos/dbprovider/startDBByName?regionUrl=${regionUrl}`,
    { dbName, dbType },
    { headers }
  );

  return { ...response.data, dbName };
}

/**
 * Core function to pause a database
 */
export async function pauseDatabase(
  dbName: string,
  currentUser: User | null,
  regionUrl: string
): Promise<{ dbName: string }> {
  if (!regionUrl) {
    throw new Error("Region URL is required");
  }

  const dbType = await getDBTypeByName(dbName, currentUser, regionUrl);
  const headers = getDBProviderHeaders(currentUser);

  const response = await axios.post(
    `/api/sealos/dbprovider/pauseDBByName?regionUrl=${regionUrl}`,
    { dbName, dbType },
    { headers }
  );

  return { ...response.data, dbName };
}

/**
 * Core function to delete a database
 */
export async function deleteDatabase(
  dbName: string,
  currentUser: User | null,
  regionUrl: string
): Promise<{ dbName: string }> {
  const headers = getDBProviderHeaders(currentUser);

  const response = await axios.delete(
    `/api/sealos/dbprovider/delDBByName?regionUrl=${regionUrl}&name=${dbName}`,
    { headers }
  );

  return { ...response.data, dbName };
}

/**
 * Core function to create a database
 */
export async function createDatabase(
  dbFormData: DBFormData,
  currentUser: User | null,
  regionUrl: string
): Promise<{ dbName: string; dbType: string }> {
  if (!regionUrl) {
    throw new Error("Region URL is required");
  }

  const headers = getDBProviderHeaders(currentUser);

  const response = await axios.post(
    `/api/sealos/dbprovider/createDB?regionUrl=${regionUrl}`,
    { dbForm: dbFormData },
    { headers }
  );

  const dbName = dbFormData.dbName || dbFormData.name || "Unknown";
  const dbType = dbFormData.dbType || "database";

  return { ...response.data, dbName, dbType };
}

/**
 * Generic function to process bulk operations with summary generation
 */
export function processBulkOperationResults<T>(
  results: BulkOperationResult<T>[],
  operationName: string
): {
  successful: BulkOperationResult<T>[];
  failed: BulkOperationResult[];
  summary: string;
} {
  const successful = results.filter(
    (r): r is BulkOperationResult<T> => r.success
  );
  const failed = results.filter((r) => !r.success);

  let summary = "";
  if (successful.length > 0) {
    summary += `Successfully ${operationName} ${successful.length} database(s):\n`;
    for (const r of successful) {
      summary += `- '${r.result || r.item}'\n`;
    }
  }
  if (failed.length > 0) {
    summary += `\nFailed to ${operationName.replace(OPERATION_NAME_REGEX, "")} ${failed.length} database(s):\n`;
    for (const r of failed) {
      summary += `- '${r.item}': ${r.error}\n`;
    }
  }

  return { successful, failed, summary: summary.trim() };
}
