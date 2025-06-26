import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { DevboxFormValues } from "@/components/flow/node/devbox/create/schema/devbox-create-schema";
import { generateDevboxFormFromTemplate } from "./devbox-utils";

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

// Release Devbox
export function releaseDevboxMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
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
      return response.data;
    },
  });
}

// Delete Devbox Version
export function deleteDevboxVersionMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
  return useMutation({
    mutationFn: async (versionName: string) => {
      const headers = getDevboxHeaders(currentUser);
      const response = await axios.delete(
        `/api/sealos/devbox/delDevboxVersionByName?regionUrl=${regionUrl}&versionName=${versionName}`,
        { headers }
      );
      return response.data;
    },
  });
}

// Create Devbox from Template Name
export function createDevboxFromTemplateMutation(
  currentUser: any,
  regionUrl: string | undefined
) {
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

      return response.data;
    },
  });
}
