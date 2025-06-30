import type { CronJobNodeData } from "@/components/flow/node/cronjob/cronjob-node";
import type { CronjobColumn } from "@/components/inventory/cronjob/cronjob-table-schema";
import { GRAPH_NAME_LABEL_KEY } from "@/lib/sealos/k8s/k8s-constant";

export function transformCronJobsToTable(data: any): CronjobColumn[] {
  // Handle response structure: { code: 200, data: [...] }
  const cronJobs = data?.data || data;

  if (!(cronJobs && Array.isArray(cronJobs))) {
    return [];
  }

  return cronJobs.map((cronJob: any) => {
    // Extract graph name from labels if available
    const graph = cronJob.metadata?.labels?.[GRAPH_NAME_LABEL_KEY] || "none";

    return {
      id: cronJob.metadata?.uid || cronJob.metadata?.name || "",
      name: cronJob.metadata?.name || "Unnamed",
      status: cronJob.spec?.suspend ? "Suspended" : "Active",
      schedule: cronJob.spec?.schedule || "N/A",
      nextRun: "TBD", // Placeholder - would need calculation based on schedule
      lastRun: cronJob.status?.lastScheduleTime
        ? new Date(cronJob.status.lastScheduleTime).toLocaleString()
        : "Never",
      createdAt: cronJob.metadata?.creationTimestamp
        ? new Date(cronJob.metadata.creationTimestamp).toLocaleDateString()
        : "N/A",
      graph,
    };
  });
}

export function transformCronJobsToNodes(data: any): CronJobNodeData[] {
  // Handle response structure: { code: 200, data: [...] }
  const cronJobs = data?.data || data;

  if (!(cronJobs && Array.isArray(cronJobs))) {
    return [];
  }

  return cronJobs.map((cronJob: any) => {
    const container =
      cronJob.spec?.jobTemplate?.spec?.template?.spec?.containers?.[0];

    return {
      id: cronJob.metadata?.uid || `cronjob-${cronJob.metadata?.name}`,
      name: cronJob.metadata?.name || "Unnamed CronJob",
      schedule: cronJob.spec?.schedule || "N/A",
      suspend: cronJob.spec?.suspend,
      concurrencyPolicy: cronJob.spec?.concurrencyPolicy,
      timeZone: cronJob.spec?.timeZone,
      image: container?.image,
      lastScheduleTime: cronJob.status?.lastScheduleTime,
      namespace: cronJob.metadata?.namespace,
    };
  });
}
