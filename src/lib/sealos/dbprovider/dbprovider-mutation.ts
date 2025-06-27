import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getDBTypeByName } from "./dbprovider-utils";
import { toast } from "sonner";

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
    onError: (error: any, dbName) => {
      toast.error(`Failed to start database '${dbName}': ${error.message}`);
    },
  });
}

// Pause Database
export function pauseDBByNameMutation(
  currentUser: any,
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
    onError: (error: any, dbName) => {
      toast.error(`Failed to pause database '${dbName}': ${error.message}`);
    },
  });
}

// Delete Database
export function delDBByNameMutation(
  currentUser: any,
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
    onError: (error: any, dbName) => {
      toast.error(`Failed to delete database '${dbName}': ${error.message}`);
    },
  });
}

// Create Database
export function createDBMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
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
    onError: (error: any, dbFormData) => {
      const dbName = dbFormData.dbName || dbFormData.name || "Unknown";
      toast.error(`Failed to create database '${dbName}': ${error.message}`);
    },
  });
}
