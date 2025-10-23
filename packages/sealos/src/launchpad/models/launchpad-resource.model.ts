import { z } from "zod";
import { DeploymentResourceSchema } from "./deployment/deployment-resource.model";
import { StatefulSetResourceSchema } from "./statefulset/statefulset-resource.model";

// Unified launchpad resource schema (discriminated union)
export const LaunchpadResourceSchema = z.discriminatedUnion("kind", [
	DeploymentResourceSchema,
	StatefulSetResourceSchema,
]);

// Re-export schemas and types from individual resource models
export { DeploymentResourceSchema } from "./deployment/deployment-resource.model";
export { StatefulSetResourceSchema } from "./statefulset/statefulset-resource.model";

export type DeploymentResource = z.infer<typeof DeploymentResourceSchema>;
export type StatefulSetResource = z.infer<typeof StatefulSetResourceSchema>;
export type LaunchpadResource = z.infer<typeof LaunchpadResourceSchema>;
