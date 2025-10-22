import { z } from "zod";
import { ClusterObjectSchema } from "@/mvvm/sealos/cluster/models/cluster-object.model";
import { DevboxObjectSchema } from "@/mvvm/sealos/devbox/models/devbox-object.model";
import { LaunchpadObjectSchema } from "@/mvvm/sealos/launchpad/models/launchpad-object.model";
import { OsbObjectSchema } from "@/mvvm/sealos/osb/models/osb-object.model";

// Union of all resource object schemas
export const ResourceObjectSchema = z.union([
	DevboxObjectSchema,
	ClusterObjectSchema,
	LaunchpadObjectSchema,
	OsbObjectSchema,
]);

// Type export
export type ResourceObject = z.infer<typeof ResourceObjectSchema>;
