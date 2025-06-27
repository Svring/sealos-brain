import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { generateDevboxFormFromTemplate } from "./devbox-utils";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (devboxName: string) => {
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/devbox/startDevbox?regionUrl=${regionUrl}`,
        { devboxName },
        { headers }
      );
      return { ...response.data, devboxName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
      toast.success(`Devbox '${data.devboxName}' is successfully started`);
    },
    onError: (error: any, devboxName) => {
      toast.error(`Failed to start devbox '${devboxName}': ${error.message}`);
    },
  });
}

// Shutdown Devbox
export function shutdownDevboxMutation(
  currentUser: any,
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
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/devbox/shutdownDevbox?regionUrl=${regionUrl}`,
        { devboxName, shutdownMode },
        { headers }
      );
      return { ...response.data, devboxName, shutdownMode };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
      const action = data.shutdownMode === "Stopped" ? "stopped" : "shutdown";
      toast.success(`Devbox '${data.devboxName}' is successfully ${action}`);
    },
    onError: (error: any, variables) => {
      const action = variables.shutdownMode === "Stopped" ? "stop" : "shutdown";
      toast.error(
        `Failed to ${action} devbox '${variables.devboxName}': ${error.message}`
      );
    },
  });
}

// Restart Devbox
export function restartDevboxMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (devboxName: string) => {
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/devbox/restartDevbox?regionUrl=${regionUrl}`,
        { devboxName },
        { headers }
      );
      return { ...response.data, devboxName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
      toast.success(`Devbox '${data.devboxName}' is successfully restarted`);
    },
    onError: (error: any, devboxName) => {
      toast.error(`Failed to restart devbox '${devboxName}': ${error.message}`);
    },
  });
}

// Delete Devbox
export function deleteDevboxMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (devboxName: string) => {
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.delete(
        `/api/sealos/devbox/delDevbox?regionUrl=${regionUrl}&devboxName=${devboxName}`,
        { headers }
      );
      return { ...response.data, devboxName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
      toast.success(`Devbox '${data.devboxName}' is successfully deleted`);
    },
    onError: (error: any, devboxName) => {
      toast.error(`Failed to delete devbox '${devboxName}': ${error.message}`);
    },
  });
}

// Create Devbox
export function createDevboxMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (devboxData: any) => {
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/devbox/createDevbox?regionUrl=${regionUrl}`,
        devboxData,
        { headers }
      );
      // Extract devbox name from the request data
      const devboxName =
        devboxData.devboxForm?.name || devboxData.name || "Unknown";
      return { ...response.data, devboxName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
      toast.success(`Devbox '${data.devboxName}' is successfully created`);
    },
    onError: (error: any, devboxData) => {
      const devboxName =
        devboxData.devboxForm?.name || devboxData.name || "Unknown";
      toast.error(`Failed to create devbox '${devboxName}': ${error.message}`);
    },
  });
}

// Release Devbox
export function releaseDevboxMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      devboxName,
      devboxUid,
      tag,
      releaseDes,
    }: {
      devboxName: string;
      devboxUid: string;
      tag: string | number;
      releaseDes: string;
    }) => {
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/devbox/releaseDevbox?regionUrl=${regionUrl}`,
        { devboxName, devboxUid, tag, releaseDes },
        { headers }
      );
      return { ...response.data, devboxName, tag };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
      queryClient.invalidateQueries({ queryKey: ["devbox", "versions"] });
      toast.success(
        `Devbox '${data.devboxName}' version '${data.tag}' is successfully released`
      );
    },
    onError: (error: any, variables) => {
      toast.error(
        `Failed to release devbox '${variables.devboxName}': ${error.message}`
      );
    },
  });
}

// Delete Devbox Version
export function deleteDevboxVersionMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (versionName: string) => {
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.delete(
        `/api/sealos/devbox/delDevboxVersionByName?regionUrl=${regionUrl}&versionName=${versionName}`,
        { headers }
      );
      return { ...response.data, versionName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["devbox", "versions"] });
      toast.success(
        `Devbox version '${data.versionName}' is successfully deleted`
      );
    },
    onError: (error: any, versionName) => {
      toast.error(
        `Failed to delete devbox version '${versionName}': ${error.message}`
      );
    },
  });
}

// Create Devbox from Template Name
export function createDevboxFromTemplateMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (templateName: string) => {
      if (!regionUrl) {
        throw new Error("Region URL is required");
      }

      // First, generate the devboxForm from template name
      const devboxForm = await generateDevboxFormFromTemplate(
        templateName,
        currentUser,
        regionUrl
      );

      // Then, create the devbox using the generated form
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.post(
        `/api/sealos/devbox/createDevbox?regionUrl=${regionUrl}`,
        { devboxForm: devboxForm },
        { headers }
      );

      return { ...response.data, devboxName: devboxForm.name, templateName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["devbox", "list"] });
      toast.success(
        `Devbox '${data.devboxName}' is successfully created from template '${data.templateName}'`
      );
    },
    onError: (error: any, templateName) => {
      toast.error(
        `Failed to create devbox from template '${templateName}': ${error.message}`
      );
    },
  });
}
