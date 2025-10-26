import { z } from "zod";

export const InstanceBridgeMetaSchema = z.object({
	name: z.any().meta({
		resources: {
			resourceType: "instance",
			path: ["metadata.name"],
		},
	}),
	uid: z.any().meta({
		resources: {
			resourceType: "instance",
			path: ["metadata.uid"],
		},
	}),
	displayName: z.any().meta({
		resources: {
			resourceType: "instance",
			path: ["metadata"],
		},
	}),
	createdAt: z.any().meta({
		resources: {
			resourceType: "instance",
			path: ["metadata.creationTimestamp"],
		},
	}),
});

export type InstanceBridgeMeta = z.infer<typeof InstanceBridgeMetaSchema>;
