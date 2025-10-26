import { z } from "zod";
import { DeploymentBridgeMetaSchema } from "./deployment/deployment-bridge.model";
import { StatefulsetBridgeMetaSchema } from "./statefulset/statefulset-bridge.model";

// Unified launchpad object query schema (discriminated union)
export const LaunchpadBridgeMetaSchema = z.discriminatedUnion("resourceType", [
	DeploymentBridgeMetaSchema.extend({
		resourceType: z.literal("deployment"),
	}),
	StatefulsetBridgeMetaSchema.extend({
		resourceType: z.literal("statefulset"),
	}),
]);

// Re-export schemas and types from individual bridge models
export { DeploymentBridgeMetaSchema } from "./deployment/deployment-bridge.model";
export { StatefulsetBridgeMetaSchema } from "./statefulset/statefulset-bridge.model";

export type DeploymentBridgeMeta = z.infer<typeof DeploymentBridgeMetaSchema>;
export type StatefulsetBridgeMeta = z.infer<typeof StatefulsetBridgeMetaSchema>;
export type LaunchpadBridgeMeta = z.infer<typeof LaunchpadBridgeMetaSchema>;
