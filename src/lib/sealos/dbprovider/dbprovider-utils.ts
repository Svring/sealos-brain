import axios from "axios";
import { DB_TYPE_VERSION_MAP } from "./dbprovider-constant";
import { customAlphabet } from "nanoid";

// Helper to get headers from currentUser
function getDBProviderHeaders(currentUser: any) {
  return {
    Authorization:
      currentUser?.tokens?.find((t: any) => t.type === "kubeconfig")?.value ||
      "",
  };
}

// Create a custom nanoid with lowercase alphabet and size 12
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz", 12);

/**
 * Get database type by database name
 * @param dbName - The name of the database
 * @param currentUser - Current user object with authentication tokens
 * @param regionUrl - The region URL for the API
 * @returns Promise<string> - The database type (e.g., "postgresql", "mongodb", etc.)
 */
export async function getDBTypeByName(
  dbName: string,
  currentUser: any,
  regionUrl: string
): Promise<string> {
  if (!dbName || !currentUser || !regionUrl) {
    throw new Error(
      "Missing required parameters: dbName, currentUser, or regionUrl"
    );
  }

  try {
    const headers = getDBProviderHeaders(currentUser);
    const response = await axios.get(
      `/api/sealos/dbprovider/getDBByName?regionUrl=${regionUrl}&name=${dbName}`,
      { headers }
    );

    // Extract dbType from the response data
    const dbType = response?.data?.dbType;

    if (!dbType) {
      throw new Error(`Database type not found for database: ${dbName}`);
    }

    return dbType;
  } catch (error: any) {
    throw new Error(
      `Failed to get database type for ${dbName}: ${error.message}`
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
  return undefined;
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
