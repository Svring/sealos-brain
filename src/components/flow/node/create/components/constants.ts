import { Box, Database, Code, Clock, HardDrive } from "lucide-react";
import { type ResourceType } from "@/lib/sealos/k8s/k8s-constant";

// Icon mapping for resource types
export const resourceIcons: Record<ResourceType, React.ComponentType<any>> = {
  devbox: Box,
  cluster: Database,
  deployment: Code,
  cronjob: Clock,
  objectstoragebucket: HardDrive,
};

// Color mapping for resource types
export const resourceColors: Record<ResourceType, string> = {
  devbox: "bg-blue-500",
  cluster: "bg-green-500",
  deployment: "bg-purple-500",
  cronjob: "bg-orange-500",
  objectstoragebucket: "bg-indigo-500",
};

// Display names for resource types
export const resourceDisplayNames: Record<ResourceType, string> = {
  devbox: "DevBox",
  cluster: "Database Cluster",
  deployment: "Deployment",
  cronjob: "Cron Job",
  objectstoragebucket: "Object Storage",
};

// Descriptions for resource types
export const resourceDescriptions: Record<ResourceType, string> = {
  devbox: "Create a new development environment",
  cluster: "Set up a database cluster instance",
  deployment: "Deploy an application",
  cronjob: "Schedule automated tasks",
  objectstoragebucket: "Manage object storage buckets",
};
