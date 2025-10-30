import { EnvSchema } from "@sealos-brain/k8s/shared/models";
import { z } from "zod";

export const DevboxObjectQuotaSchema = z.object({
	cpu: z.number(),
	memory: z.number(),
});

export const SshSchema = z.object({
	host: z.string().nullable(),
	port: z.number().nullable(),
	user: z.string().nullable(),
	workingDir: z.string().nullable(),
	privateKey: z.string().nullable().optional(),
});

export const DevboxObjectPortSchema = z.object({
	number: z.number(),
	portName: z.string().optional(),
	protocol: z.string().optional(),
	serviceName: z.string().optional(),
	privateAddress: z.string().optional(),
	privateHost: z.string().optional(),
	networkName: z.string().optional(),
	publicHost: z.string().optional(),
	publicAddress: z.string().optional(),
	customDomain: z.string().optional(),
});

const PodSchema = z.object({
	name: z.string(),
	status: z.string(),
});

export const DevboxObjectSchema = z.object({
	name: z.string(),
	uid: z.string(),
	resourceType: z.string().default("devbox"),
	runtime: z.string(),
	image: z.string(),
	status: z.string(),
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
