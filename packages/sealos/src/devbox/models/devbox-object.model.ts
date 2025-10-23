import { EnvSchema } from "@sealos-brain/k8s/shared/models";
import { z } from "zod";

export const ResourceSchema = z.object({
	cpu: z.number(),
	memory: z.number(),
});

export const SshSchema = z.object({
	host: z.string(),
	port: z.number(),
	user: z.string(),
	workingDir: z.string(),
	privateKey: z.string().optional(),
});

export const PortSchema = z.object({
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
	resource: ResourceSchema,
	ssh: SshSchema,
	env: z.array(EnvSchema).optional(),
	ports: z.array(PortSchema),
	pods: z.array(PodSchema).optional(),
	operationalStatus: z.any().optional(),
});

export type Resource = z.infer<typeof ResourceSchema>;
export type Ssh = z.infer<typeof SshSchema>;
export type Port = z.infer<typeof PortSchema>;
export type DevboxObject = z.infer<typeof DevboxObjectSchema>;
