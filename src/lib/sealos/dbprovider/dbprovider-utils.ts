import axios from "axios";

// Helper to get headers from currentUser
function getDBProviderHeaders(currentUser: any) {
  return {
    Authorization:
      currentUser?.tokens?.find((t: any) => t.type === "kubeconfig")?.value ||
      "",
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
