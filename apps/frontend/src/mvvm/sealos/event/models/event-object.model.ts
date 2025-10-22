import { z } from "zod";

// Event object schema - simplified version for UI consumption
export const EventObjectSchema = z.object({
	name: z.string(),
	resourceType: z.string().default("event"),
	reason: z.string(),
	type: z.string(),
	message: z.string(),
	firstTimestamp: z.string(),
	lastTimestamp: z.string(),
	count: z.number(),
});

// Event record schema - represents events grouped by pod name
export const EventRecordSchema = z.object({
	events: z.array(EventObjectSchema),
	success: z.boolean().optional(),
	error: z.string().optional(),
});

// Events record schema - represents all events for multiple pods
export const EventsRecordSchema = z.record(z.string(), EventRecordSchema);

// Type exports
export type EventObject = z.infer<typeof EventObjectSchema>;
export type EventRecord = z.infer<typeof EventRecordSchema>;
export type EventsRecord = z.infer<typeof EventsRecordSchema>;
