import { z } from "zod";
import { ClusterObjectSchema } from "#cluster/models";
import { DevboxObjectSchema } from "#devbox/models";
import { LaunchpadObjectSchema } from "#launchpad/models";
import { OsbObjectSchema } from "#osb/models";

// Union of all resource object schemas
export const ResourceObjectSchema = z.union([
	DevboxObjectSchema,
	ClusterObjectSchema,
	LaunchpadObjectSchema,
	OsbObjectSchema,
]);

// Type export
export type ResourceObject = z.infer<typeof ResourceObjectSchema>;
