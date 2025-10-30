import { EnvSchema, NameSchema } from "@sealos-brain/k8s/shared/models";
import { nanoid } from "@sealos-brain/shared/misc/utils";
import { z } from "zod";
import {
	LAUNCHPAD_CPU_OPTIONS,
	LAUNCHPAD_MEMORY_OPTIONS,
	LAUNCHPAD_REPLICAS_OPTIONS,
} from "../constants/launchpad-resource.constant";

// Component schemas
export const LaunchCommandSchema = z.object({
	command: z.array(z.string()).optional(),
	args: z.array(z.string()).optional(),
});

export const ImageRegistrySchema = z.object({
	username: z.string(),
	password: z.string(),
	serverAddress: z.string(),
});

export const ImageSchema = z.object({
	imageName: z.string().optional(),
	imageRegistry: ImageRegistrySchema.nullable().optional(),
});

export const LaunchpadCreateResourceSchema = z.object({
	replicas: z.literal(LAUNCHPAD_REPLICAS_OPTIONS),
	cpu: z.literal(LAUNCHPAD_CPU_OPTIONS),
	memory: z.literal(LAUNCHPAD_MEMORY_OPTIONS),
});

export const LaunchpadPortCreateSchema = z.object({
	number: z.number().min(1).max(65535),
	protocol: z.enum(["HTTP", "GRPC", "WS", "TCP", "UDP"]).default("HTTP"),
	exposesPublicDomain: z.boolean().default(true),
});

export const StorageSchema = z.object({
	path: z.string(),
	value: z.string(),
});

export const ConfigMapSchema = z.object({
	path: z.string(),
	content: z.string(),
});

// Main launchpad create form schema
export const launchpadCreateSchema = z.object({
	name: NameSchema.default(() => `launchpad-${nanoid()}`),
	image: ImageSchema.default({
		imageName: "nginx",
	}),
	launchCommand: LaunchCommandSchema.optional(),
	resource: LaunchpadCreateResourceSchema.default({
		replicas: 1,
		cpu: 0.5,
		memory: 0.5,
	}),
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
		.default([
			{
				number: 80,
				protocol: "HTTP",
				exposesPublicDomain: true,
			},
		]),
	env: z.array(EnvSchema).optional(),
	storage: z.array(StorageSchema).optional(),
	configMap: z.array(ConfigMapSchema).optional(),
});

// Export types
export type LaunchpadCreate = z.infer<typeof launchpadCreateSchema>;
