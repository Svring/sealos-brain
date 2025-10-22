import { z } from "zod";
import {
	DEVBOX_CPU_OPTIONS,
	DEVBOX_MEMORY_OPTIONS,
} from "@/constants/devbox/devbox-resource.constant";
import { DEVBOX_RUNTIMES } from "@/constants/devbox/devbox-runtime.constant";
import { createNumberUnionSchema, nanoid } from "@/lib/utils";
import { EnvSchema, NameSchema } from "@/mvvm/k8s/models/k8s-resource.model";

// Component schemas
export const DevboxRuntimeSchema = z.enum(DEVBOX_RUNTIMES);

export const DevboxResourceSchema = z.object({
	cpu: createNumberUnionSchema(DEVBOX_CPU_OPTIONS),
	memory: createNumberUnionSchema(DEVBOX_MEMORY_OPTIONS),
});

export const DevboxPortCreateSchema = z.object({
	number: z.number().min(1).max(65535),
	protocol: z.enum(["HTTP", "GRPC", "WS"]).default("HTTP"),
	exposesPublicDomain: z.boolean().default(true),
});

// Main devbox create form schema
export const devboxCreateSchema = z.object({
	name: NameSchema.default(() => `devbox-${nanoid()}`),
	runtime: DevboxRuntimeSchema.default("next.js"),
	resource: DevboxResourceSchema.default({
		cpu: 1,
		memory: 2,
	}),
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
		.default([]),
	env: z.array(EnvSchema).default([]),
	autostart: z.boolean().default(true),
});

// Export types
export type DevboxCreateData = z.infer<typeof devboxCreateSchema>;
