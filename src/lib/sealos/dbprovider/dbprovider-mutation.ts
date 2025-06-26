import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { getDBTypeByName } from "./dbprovider-utils";

// Helper to get headers from currentUser
function getDBProviderHeaders(currentUser: any) {
  return {
    Authorization:
      currentUser?.tokens?.find((t: any) => t.type === "kubeconfig")?.value ||
      "",
  };
}

// Start Database
export function startDBByNameMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
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
      return response.data;
    },
  });
}

// Pause Database
export function pauseDBByNameMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
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
      return response.data;
    },
  });
}

// Delete Database
export function delDBByNameMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
  return useMutation({
    mutationFn: async (dbName: string) => {
      const headers = getDBProviderHeaders(currentUser);
      const response = await axios.delete(
        `/api/sealos/dbprovider/delDBByName?regionUrl=${regionUrl}&name=${dbName}`,
        { headers }
      );
      return response.data;
    },
  });
}

// Create Database
export function createDBMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
  return useMutation({
    mutationFn: async (dbFormData: any) => {
      if (!regionUrl) {
        throw new Error("Region URL is required");
      }
      const headers = getDBProviderHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/dbprovider/createDB?regionUrl=${regionUrl}`,
        dbFormData,
        { headers }
      );
      return response.data;
    },
  });
}
