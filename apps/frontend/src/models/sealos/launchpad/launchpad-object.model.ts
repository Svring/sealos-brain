import { z } from "zod";
import { DeploymentObjectSchema } from "./deployment/deployment-object.model";
import { StatefulsetObjectSchema } from "./statefulset/statefulset-object.model";

// Unified launchpad object schema (discriminated union)
export const LaunchpadObjectSchema = z.discriminatedUnion("resourceType", [
	DeploymentObjectSchema,
	StatefulsetObjectSchema,
]);

// Re-export schemas and types from individual object models
export { DeploymentObjectSchema } from "./deployment/deployment-object.model";
export { StatefulsetObjectSchema } from "./statefulset/statefulset-object.model";

export type DeploymentObject = z.infer<typeof DeploymentObjectSchema>;
export type StatefulsetObject = z.infer<typeof StatefulsetObjectSchema>;
export type LaunchpadObject = z.infer<typeof LaunchpadObjectSchema>;
