import { z } from "zod";
import { ClusterObjectSchema } from "@sealos-brain/sealos/cluster/models";
import { DevboxObjectSchema } from "@sealos-brain/sealos/devbox/models";
import { LaunchpadObjectSchema } from "@sealos-brain/sealos/launchpad/models";
import { OsbObjectSchema } from "@sealos-brain/sealos/osb/models";

// Union of all resource object schemas
export const ResourceObjectSchema = z.union([
	DevboxObjectSchema,
	ClusterObjectSchema,
	LaunchpadObjectSchema,
	OsbObjectSchema,
]);

// Type export
export type ResourceObject = z.infer<typeof ResourceObjectSchema>;
