import { useMutation } from "@tanstack/react-query";
import axios from "axios";

// Helper to get headers from currentUser
function getDevboxHeaders(currentUser: any) {
  return {
    Authorization:
      currentUser?.tokens?.find((t: any) => t.type === "kubeconfig")?.value ||
      "",
    "Authorization-Bearer":
      currentUser?.tokens?.find((t: any) => t.type === "custom")?.value || "",
  };
}

// Start Devbox
export function startDevboxMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
  return useMutation({
    mutationFn: async (devboxName: string) => {
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/devbox/startDevbox?regionUrl=${regionUrl}`,
        { devboxName },
        { headers }
      );
      return response.data;
    },
  });
}

// Shutdown Devbox
export function shutdownDevboxMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
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
      return response.data;
    },
  });
}

// Restart Devbox
export function restartDevboxMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
  return useMutation({
    mutationFn: async (devboxName: string) => {
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/devbox/restartDevbox?regionUrl=${regionUrl}`,
        { devboxName },
        { headers }
      );
      return response.data;
    },
  });
}

// Delete Devbox
export function deleteDevboxMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
  return useMutation({
    mutationFn: async (devboxName: string) => {
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.delete(
        `/api/sealos/devbox/delDevbox?regionUrl=${regionUrl}&devboxName=${devboxName}`,
        { headers }
      );
      return response.data;
    },
  });
}

// Create Devbox
export function createDevboxMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
  return useMutation({
    mutationFn: async (devboxData: any) => {
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/devbox/createDevbox?regionUrl=${regionUrl}`,
        devboxData,
        { headers }
      );
      return response.data;
    },
  });
}
