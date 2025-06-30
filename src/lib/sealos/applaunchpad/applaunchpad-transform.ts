import { z } from "zod";
import { GRAPH_NAME_LABEL_KEY } from "@/lib/sealos/k8s/k8s-constant";
import type {
  AppDetailData,
  AppDetailResponse,
  EnvVar,
  Network,
} from "./schemas/applaunchpad-detail-schema";
import {
  AppLaunchpadCondition,
  type AppLaunchpadDeployment,
  type AppLaunchpadListData,
} from "./schemas/applaunchpad-list-schema";

export interface AppLaunchpadNodeDisplayData extends Record<string, unknown> {
  id: string;
  state: "Running" | "Stopped" | "Unknown" | "Creating" | "Failed";
  appName: string;
  image?: string;
  replicas?: number;
}

/**
 * Transform AppLaunchpad list into lightweight node display data
 * Only includes data needed for node rendering
 */
export const transformAppLaunchpadListIntoNode = (
  data: AppLaunchpadListData
): AppLaunchpadNodeDisplayData[] => {
  if (!Array.isArray(data)) {
    console.error("Expected array but got:", typeof data, data);
    return [];
  }

  return data
    .map((deployment): AppLaunchpadNodeDisplayData | null => {
      if (!deployment || typeof deployment !== "object") return null;

      const appName = deployment.metadata.name;
      const image = deployment.spec.template.spec.containers[0]?.image;
      const replicas = deployment.spec.replicas;

      // Determine state from deployment status
      let state: AppLaunchpadNodeDisplayData["state"] = "Unknown";

      if (deployment.status.conditions) {
        const availableCondition = deployment.status.conditions.find(
          (condition) => condition.type === "Available"
        );
        const progressingCondition = deployment.status.conditions.find(
          (condition) => condition.type === "Progressing"
        );

        if (availableCondition?.status === "True") {
          state = "Running";
        } else if (availableCondition?.status === "False") {
          if (progressingCondition?.status === "True") {
            state = "Creating";
          } else {
            state = "Failed";
          }
        } else if (deployment.status.replicas === 0) {
          state = "Stopped";
        }
      }

      return {
        id: `applaunchpad-${appName}`,
        state,
        appName,
        image,
        replicas,
      };
    })
    .filter((item): item is AppLaunchpadNodeDisplayData => item !== null);
};

/**
 * Transform AppLaunchpad list into table data format
 * Converts API response to format expected by the AppLaunchpadColumn schema
 */
export const transformAppLaunchpadListToTable = (
  data: AppLaunchpadListData
) => {
  if (!Array.isArray(data)) {
    console.error("Expected array but got:", typeof data, data);
    return [];
  }

  return data
    .map((deployment) => {
      if (!deployment || typeof deployment !== "object") return null;

      const appName = deployment.metadata.name;

      // Determine status from deployment conditions
      let status = "Unknown";
      if (deployment.status.conditions) {
        const availableCondition = deployment.status.conditions.find(
          (condition) => condition.type === "Available"
        );
        const progressingCondition = deployment.status.conditions.find(
          (condition) => condition.type === "Progressing"
        );

        if (availableCondition?.status === "True") {
          status = "Running";
        } else if (availableCondition?.status === "False") {
          if (progressingCondition?.status === "True") {
            status = "Creating";
          } else {
            status = "Failed";
          }
        } else if (deployment.status.replicas === 0) {
          status = "Stopped";
        }
      }

      // Format creation timestamp
      const createdAt = new Date(
        deployment.metadata.creationTimestamp
      ).toLocaleDateString();

      // Get replicas info
      const replicas = `${deployment.status.readyReplicas || 0}/${deployment.spec.replicas}`;

      // Calculate estimated cost based on resources
      const container = deployment.spec.template.spec.containers[0];
      let cost = "$0.00/day";

      if (container?.resources) {
        const cpuRequest = container.resources.requests.cpu;
        const memoryRequest = container.resources.requests.memory;

        // Parse CPU (e.g., "200m" -> 0.2 cores)
        const cpuCores =
          Number.parseFloat(cpuRequest.replace(/[^0-9.]/g, "")) /
          (cpuRequest.includes("m") ? 1000 : 1);

        // Parse memory (e.g., "409Mi" -> MB)
        const memoryMB =
          Number.parseFloat(memoryRequest.replace(/[^0-9.]/g, "")) *
          (memoryRequest.includes("Gi")
            ? 1024
            : memoryRequest.includes("Mi")
              ? 1
              : 0.001);

        const estimatedCost = cpuCores * 0.02 + memoryMB * 0.000_01; // Rough estimate
        cost = `$${estimatedCost.toFixed(2)}/day`;
      }

      // Extract graph name from labels
      const graph =
        deployment.metadata.labels?.[GRAPH_NAME_LABEL_KEY] || "none";

      return {
        id: `applaunchpad-${appName}`,
        name: appName,
        status,
        createdAt,
        replicas,
        cost,
        graph,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
};

/**
 * Get the appropriate status color and variant for deployment status
 */
export function getAppLaunchpadStatusInfo(status: string) {
  switch (status.toLowerCase()) {
    case "running":
      return { variant: "default", color: "text-green-600" };
    case "stopped":
      return { variant: "secondary", color: "text-gray-600" };
    case "creating":
      return { variant: "outline", color: "text-blue-600" };
    case "failed":
      return { variant: "destructive", color: "text-red-600" };
    default:
      return { variant: "secondary", color: "text-gray-600" };
  }
}

/**
 * Extract resource information from deployment
 */
export function extractResourceInfo(deployment: AppLaunchpadDeployment) {
  const container = deployment.spec.template.spec.containers[0];

  if (!container?.resources) {
    return { cpu: "Unknown", memory: "Unknown" };
  }

  return {
    cpu: container.resources.requests.cpu,
    memory: container.resources.requests.memory,
    cpuLimit: container.resources.limits.cpu,
    memoryLimit: container.resources.limits.memory,
  };
}

/**
 * Extract environment variables from deployment
 */
export function extractEnvironmentVariables(
  deployment: AppLaunchpadDeployment
) {
  const container = deployment.spec.template.spec.containers[0];
  return container?.env || [];
}

/**
 * Extract port information from deployment
 */
export function extractPortInfo(deployment: AppLaunchpadDeployment) {
  const container = deployment.spec.template.spec.containers[0];
  return container?.ports || [];
}

/**
 * Transform AppLaunchpad detail API response
 * Returns parsed app detail data with validation
 */
export const transformAppLaunchpadDetailResponse = (
  response: AppDetailResponse
): AppDetailData => {
  return response.data;
};

/**
 * Extract public URLs from app detail networks
 */
export function extractPublicUrls(networks: Network[]): string[] {
  return networks
    .filter((network) => network.openPublicDomain && network.publicDomain)
    .map((network) => `https://${network.publicDomain}.${network.domain}`);
}

/**
 * Extract environment variables as key-value pairs
 */
export function extractEnvVars(envs: EnvVar[]): Record<string, string> {
  return envs.reduce(
    (acc, env) => {
      acc[env.key] = env.value;
      return acc;
    },
    {} as Record<string, string>
  );
}

/**
 * Calculate resource costs from app detail data
 */
export function calculateAppResourceCost(app: AppDetailData): string {
  const cpuCores = app.cpu / 1000; // Convert millicores to cores
  const memoryGB = app.memory / 1024; // Convert MB to GB
  const cost = cpuCores * 0.02 + memoryGB * 0.01; // Rough estimate
  return `$${cost.toFixed(2)}/day`;
}

/**
 * Get status display info for app detail status
 */
export function getAppDetailStatusInfo(status: AppDetailData["status"]) {
  const value = status.value.toLowerCase();

  switch (value) {
    case "running":
      return { variant: "default", color: "text-green-600", label: "Running" };
    case "stopped":
    case "paused":
      return { variant: "secondary", color: "text-gray-600", label: "Stopped" };
    case "waiting":
    case "creating":
      return { variant: "outline", color: "text-blue-600", label: "Creating" };
    case "failed":
    case "error":
      return { variant: "destructive", color: "text-red-600", label: "Failed" };
    default:
      return {
        variant: "secondary",
        color: "text-gray-600",
        label: status.label,
      };
  }
}
