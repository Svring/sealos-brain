import { z } from "zod";

// Port schema for pod object
export const PodPortSchema = z.object({
	name: z.string(),
	containerPort: z.number(),
	protocol: z.string().default("TCP"),
	containerName: z.string(),
});

// Resource schema for pod object
export const PodResourceSchema = z.object({
	containerName: z.string(),
	requests: z.record(z.string(), z.string()),
	limits: z.record(z.string(), z.string()),
});

// Container state schema for pod object
export const PodContainerStateSchema = z.object({
	running: z.object({
		startedAt: z.string(),
	}).optional(),
	waiting: z.object({
		reason: z.string().optional(),
		message: z.string().optional(),
	}).optional(),
	terminated: z.object({
		exitCode: z.number().optional(),
		signal: z.number().optional(),
		reason: z.string().optional(),
		message: z.string().optional(),
		startedAt: z.string().optional(),
		finishedAt: z.string().optional(),
		containerID: z.string().optional(),
	}).optional(),
});

// Container status schema for pod object
export const PodContainerStatusSchema = z.object({
	name: z.string(),
	ready: z.boolean(),
	restartCount: z.number(),
	started: z.boolean().optional(),
	state: PodContainerStateSchema.optional(),
	lastState: PodContainerStateSchema.optional(),
	containerID: z.string().optional(),
	image: z.string(),
	imageID: z.string(),
});

// Main pod object schema
export const PodObjectSchema = z.object({
	name: z.string(),
	resourceType: z.string().default("pod"),
	createdAt: z.string().nullable(),
	ports: z.array(PodPortSchema),
	resources: z.array(PodResourceSchema),
	containerStatuses: z.array(PodContainerStatusSchema),
});

// Type exports
export type PodPort = z.infer<typeof PodPortSchema>;
export type PodResource = z.infer<typeof PodResourceSchema>;
export type PodContainerState = z.infer<typeof PodContainerStateSchema>;
export type PodContainerStatus = z.infer<typeof PodContainerStatusSchema>;
export type PodObject = z.infer<typeof PodObjectSchema>;
