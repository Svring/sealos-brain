import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Helper to get headers from currentUser
function getAppLaunchpadHeaders(currentUser: any) {
  return {
    Authorization:
      currentUser?.tokens?.find((t: any) => t.type === "kubeconfig")?.value ||
      "",
  };
}

// Start App
export function startAppMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appName: string) => {
      const headers = getAppLaunchpadHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/applaunchpad/startApp?regionUrl=${regionUrl}`,
        { appName },
        { headers }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applaunchpad", "list"] });
    },
  });
}

// Restart App
export function restartAppMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appName: string) => {
      const headers = getAppLaunchpadHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/applaunchpad/restartApp?regionUrl=${regionUrl}`,
        { appName },
        { headers }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applaunchpad", "list"] });
    },
  });
}

// Pause App
export function pauseAppMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appName: string) => {
      const headers = getAppLaunchpadHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/applaunchpad/pauseApp?regionUrl=${regionUrl}`,
        { appName },
        { headers }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applaunchpad", "list"] });
    },
  });
}

// Delete App
export function delAppMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appName: string) => {
      const headers = getAppLaunchpadHeaders(currentUser);
      const response = await axios.delete(
        `/api/sealos/applaunchpad/delApp?regionUrl=${regionUrl}&appName=${appName}`,
        { headers }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applaunchpad", "list"] });
    },
  });
}
