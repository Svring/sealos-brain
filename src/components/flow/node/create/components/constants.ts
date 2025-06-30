import { Box, Database, HardDrive } from "lucide-react";
import type { ComponentType } from "react";
// Redefine ResourceType locally to only include the types we want in the UI
export type UIResourceType = "devbox" | "cluster" | "objectstoragebucket";

// Icon mapping for resource types
export const resourceIcons: Record<UIResourceType, ComponentType<unknown>> = {
  devbox: Box as ComponentType<unknown>,
  cluster: Database as ComponentType<unknown>,
  objectstoragebucket: HardDrive as ComponentType<unknown>,
};

// Color mapping for resource types
export const resourceColors: Record<UIResourceType, string> = {
  devbox: "bg-blue-500",
  cluster: "bg-green-500",
  objectstoragebucket: "bg-indigo-500",
};

// Display names for resource types
export const resourceDisplayNames: Record<UIResourceType, string> = {
  devbox: "DevBox",
  cluster: "Database Cluster",
  objectstoragebucket: "Object Storage",
};

// Descriptions for resource types
export const resourceDescriptions: Record<UIResourceType, string> = {
  devbox: "Create a new development environment",
  cluster: "Set up a database cluster instance",
  objectstoragebucket: "Manage object storage buckets",
};
