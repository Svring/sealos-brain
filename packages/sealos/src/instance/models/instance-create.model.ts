import { clusterCreateSchema } from "@sealos-brain/sealos/cluster/models";
import { devboxCreateSchema } from "@sealos-brain/sealos/devbox/models";
import { launchpadCreateSchema } from "@sealos-brain/sealos/launchpad/models";
import { z } from "zod";

export const InstanceCreateSchema = z.object({
	name: z.string(),
	resources: z
		.object({
			devbox: z.array(devboxCreateSchema).optional(),
			cluster: z.array(clusterCreateSchema).optional(),
			launchpad: z.array(launchpadCreateSchema).optional(),
		})
		.optional(),
});

export type InstanceCreate = z.infer<typeof InstanceCreateSchema>;
