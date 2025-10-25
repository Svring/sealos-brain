import { z } from "zod";
import { INSTANCE_ANNOTATIONS } from "../constants/instance-annotations.constant";

export const InstanceBridgeSchema = z.object({
	name: z.any().describe(
		JSON.stringify({
			resourceType: "instance",
			path: ["metadata.name"],
		}),
	),
	uid: z.any().describe(
		JSON.stringify({
			resourceType: "instance",
			path: ["metadata.uid"],
		}),
	),
	displayName: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "instance",
				path: ["metadata"],
			}),
		)
		.transform((resourceMetadata) => {
			// Safely get instanceDisplayName using bracket notation to handle dots in key names
			const instanceDisplayName =
				resourceMetadata?.annotations?.[INSTANCE_ANNOTATIONS.DISPLAY_NAME];
			return instanceDisplayName ?? resourceMetadata.name;
		}),
	createdAt: z.any().describe(
		JSON.stringify({
			resourceType: "instance",
			path: ["metadata.creationTimestamp"],
		}),
	),
});

export type InstanceBridge = z.infer<typeof InstanceBridgeSchema>;
