import { EnvSchema, NameSchema } from "@sealos-brain/k8s/shared/models";
import { z } from "zod";
import {
	DEVBOX_CPU_OPTIONS,
	DEVBOX_MEMORY_OPTIONS,
} from "../constants/devbox-resource.constant";
import { DEVBOX_RUNTIMES } from "../constants/devbox-runtime.constant";

// Component schemas
export const DevboxRuntimeSchema = z.enum(DEVBOX_RUNTIMES);

export const DevboxCreateQuotaSchema = z.object({
	cpu: z.literal(DEVBOX_CPU_OPTIONS),
	memory: z.literal(DEVBOX_MEMORY_OPTIONS),
});

export const DevboxPortCreateSchema = z.object({
	number: z.number().min(1).max(65535),
	protocol: z.enum(["HTTP", "GRPC", "WS"]).default("HTTP"),
	exposesPublicDomain: z.boolean().default(true),
});

// Main devbox create form schema
export const devboxCreateSchema = z.object({
	name: NameSchema,
	runtime: DevboxRuntimeSchema.default("next.js"),
	quota: DevboxCreateQuotaSchema.default({
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
export type DevboxCreate = z.infer<typeof devboxCreateSchema>;
