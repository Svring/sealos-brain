import { z } from "zod";
import { INSTANCE_ANNOTATIONS } from "../constants/instance-annotations.constant";

// Transform functions

// biome-ignore lint/suspicious/noExplicitAny: Generic resource transformation
const transformDisplayName = (resourceMetadata: any) => {
	// Safely get instanceDisplayName using bracket notation to handle dots in key names
	const instanceDisplayName =
		resourceMetadata?.annotations?.[INSTANCE_ANNOTATIONS.DISPLAY_NAME];
	return instanceDisplayName ?? resourceMetadata.name;
};

// Transform schema
export const InstanceBridgeTransSchema = z.object({
	name: z.any(),
	uid: z.any(),
	displayName: z.any().transform(transformDisplayName),
	createdAt: z.any(),
});
