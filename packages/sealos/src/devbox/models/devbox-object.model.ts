import { EnvSchema, NameSchema } from "@sealos-brain/k8s/shared/models";
import { z } from "zod";

export const DevboxObjectQuotaSchema = z.object({
	cpu: z.number().min(0.5).max(32),
	memory: z.number().min(0.5).max(32),
});

export const SshSchema = z.object({
	host: z.hostname(),
	port: z.int().min(1).max(65535),
	user: z.string().check(z.maxLength(16)),
	workingDir: z.string(),
	privateKey: z.base64(),
});

export const DevboxObjectPortSchema = z.object({
	number: z.int().min(1).max(65535),
	portName: NameSchema,
	protocol: z.enum(["http", "trpc", "ws"]),
	privateHost: z.hostname(),
	publicHost: z.hostname(),
	customDomain: z.hostname(),
});

const PodSchema = z.object({
	name: NameSchema,
	status: z.enum(["running", "stopped", "pending", "deleting", "error"]),
});

export const DevboxObjectSchema = z.object({
	name: NameSchema,
	uid: z.uuid(),
	resourceType: z.literal("devbox"),
	runtime: z.string().check(z.minLength(1), z.maxLength(16)),
	image: z.string().check(z.minLength(1), z.maxLength(128)),
	status: z.enum(["running", "stopped", "pending", "deleting", "error"]),
	quota: DevboxObjectQuotaSchema,
	ssh: SshSchema,
	env: z.array(EnvSchema).optional(),
	ports: z.array(DevboxObjectPortSchema),
	pods: z.array(PodSchema).optional(),
	operationalStatus: z.any().optional(),
});

export type DevboxObjectQuota = z.infer<typeof DevboxObjectQuotaSchema>;
export type Ssh = z.infer<typeof SshSchema>;
export type DevboxObjectPort = z.infer<typeof DevboxObjectPortSchema>;
export type DevboxObject = z.infer<typeof DevboxObjectSchema>;
