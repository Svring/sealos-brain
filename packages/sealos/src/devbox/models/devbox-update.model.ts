import { NameSchema } from "@sealos-brain/k8s/shared/models";
import { z } from "zod";
import {
	DevboxPortCreateSchema,
	DevboxResourceSchema,
} from "./devbox-create.model";

// Update form schema (all fields optional for partial updates)
export const devboxUpdateSchema = z.object({
	name: NameSchema,
	resource: DevboxResourceSchema.optional(),
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

export type DevboxUpdateData = z.infer<typeof devboxUpdateSchema>;
