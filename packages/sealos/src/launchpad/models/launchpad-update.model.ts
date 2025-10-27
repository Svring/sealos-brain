import { EnvSchema, NameSchema } from "@sealos-brain/k8s/shared/models";
import { createNumberUnionSchema } from "@sealos-brain/shared/misc/utils";
import { z } from "zod";
import {
	LAUNCHPAD_CPU_OPTIONS,
	LAUNCHPAD_MEMORY_OPTIONS,
	LAUNCHPAD_REPLICAS_OPTIONS,
} from "../constants/launchpad-resource.constant";
import {
	ConfigMapSchema,
	ImageSchema,
	LaunchCommandSchema,
	LaunchpadPortCreateSchema,
	StorageSchema,
} from "./launchpad-create.model";

// Launchpad resource update schema (all fields optional for updates)
export const LaunchpadResourceUpdateSchema = z.object({
	replicas: createNumberUnionSchema(LAUNCHPAD_REPLICAS_OPTIONS).optional(),
	cpu: createNumberUnionSchema(LAUNCHPAD_CPU_OPTIONS).optional(),
	memory: createNumberUnionSchema(LAUNCHPAD_MEMORY_OPTIONS).optional(),
});

// Update form schema (all fields optional for partial updates)
export const launchpadUpdateSchema = z.object({
	name: NameSchema,
	image: ImageSchema.optional(),
	launchCommand: LaunchCommandSchema.optional(),
	resource: LaunchpadResourceUpdateSchema.optional(),
	ports: z
		.array(LaunchpadPortCreateSchema)
		.refine(
			(ports) => {
				if (!ports?.length) return true;
				const numbers = ports.map((p) => p.number);
				return z.set(z.number()).safeParse(numbers).success;
			},
			{ message: "All ports must have unique port numbers" },
		)
		.optional(),
	env: z.array(EnvSchema).optional(),
	storage: z.array(StorageSchema).optional(),
	configMap: z.array(ConfigMapSchema).optional(),
});

export type LaunchpadUpdate = z.infer<typeof launchpadUpdateSchema>;
