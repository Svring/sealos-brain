import { NameSchema } from "@sealos-brain/k8s/shared/models";
import { z } from "zod";
import {
	DEVBOX_CPU_OPTIONS,
	DEVBOX_MEMORY_OPTIONS,
} from "../constants/devbox-resource.constant";
import { DevboxPortCreateSchema } from "./devbox-create.model";

// Devbox quota update schema (all fields optional for updates)
export const DevboxQuotaUpdateSchema = z.object({
	cpu: z.literal(DEVBOX_CPU_OPTIONS).optional(),
	memory: z.literal(DEVBOX_MEMORY_OPTIONS).optional(),
});

// Update form schema (all fields optional for partial updates)
export const devboxUpdateSchema = z.object({
	name: NameSchema,
	quota: DevboxQuotaUpdateSchema.optional(),
	ports: z
		.array(DevboxPortCreateSchema)
		.refine(
			(ports) => {
				if (!ports?.length) return true;
				const numbers = ports.map((p) => p.number);
				return z.set(z.number()).safeParse(numbers).success;
			},
			{ message: "All ports must have unique port numbers" },
		)
		.optional(),
});

export type DevboxUpdate = z.infer<typeof devboxUpdateSchema>;
