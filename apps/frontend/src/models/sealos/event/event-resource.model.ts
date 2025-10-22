import { z } from "zod";

// Involved object schema - represents the object that the event is about
export const InvolvedObjectSchema = z.object({
	apiVersion: z.string(),
	fieldPath: z.string().optional(),
	kind: z.string(),
	name: z.string(),
	namespace: z.string().optional(),
	resourceVersion: z.string().optional(),
	uid: z.string().optional(),
});

// Event source schema - represents the component that generated the event
export const EventSourceSchema = z.object({
	component: z.string().optional(),
	host: z.string().optional(),
});

// Event metadata schema
export const EventMetadataSchema = z.object({
	creationTimestamp: z.string().optional(),
	name: z.string(),
	namespace: z.string().optional(),
	resourceVersion: z.string().optional(),
	uid: z.string().optional(),
});

// Main event resource schema
export const EventResourceSchema = z.object({
	apiVersion: z.literal("v1").optional().default("v1"),
	kind: z.literal("Event").optional().default("Event"),
	metadata: EventMetadataSchema,
	count: z.number().optional(),
	eventTime: z.string().nullable().optional(),
	firstTimestamp: z.string().optional(),
	involvedObject: InvolvedObjectSchema,
	lastTimestamp: z.string().optional(),
	message: z.string().optional(),
	reason: z.string().optional(),
	reportingComponent: z.string().optional(),
	reportingInstance: z.string().optional(),
	source: EventSourceSchema.optional(),
	type: z.string().optional(),
});

// Event list schema for the complete response
export const EventListSchema = z.object({
	apiVersion: z.literal("v1").optional().default("v1"),
	kind: z.literal("List").optional().default("List"),
	metadata: z.object({
		resourceVersion: z.string().optional(),
	}),
	items: z.array(EventResourceSchema),
});

// Type exports
export type InvolvedObject = z.infer<typeof InvolvedObjectSchema>;
export type EventSource = z.infer<typeof EventSourceSchema>;
export type EventMetadata = z.infer<typeof EventMetadataSchema>;
export type EventResource = z.infer<typeof EventResourceSchema>;
export type EventList = z.infer<typeof EventListSchema>;
