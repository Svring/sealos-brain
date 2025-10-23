import { z } from "zod";
import { DeploymentBridgeSchema } from "./deployment/deployment-bridge.model";
import { StatefulsetBridgeSchema } from "./statefulset/statefulset-bridge.model";

// Unified launchpad object query schema (discriminated union)
export const LaunchpadObjectQuerySchema = z.discriminatedUnion("resourceType", [
	DeploymentBridgeSchema.extend({
		resourceType: z.literal("deployment"),
	}),
	StatefulsetBridgeSchema.extend({
		resourceType: z.literal("statefulset"),
	}),
]);

// Re-export schemas and types from individual bridge models
export { DeploymentBridgeSchema as DeploymentObjectQuerySchema } from "./deployment/deployment-bridge.model";
export { StatefulsetBridgeSchema as StatefulsetObjectQuerySchema } from "./statefulset/statefulset-bridge.model";

export type DeploymentObjectQuery = z.infer<typeof DeploymentBridgeSchema>;
export type StatefulsetObjectQuery = z.infer<typeof StatefulsetBridgeSchema>;
export type LaunchpadObjectQuery = z.infer<typeof LaunchpadObjectQuerySchema>;
