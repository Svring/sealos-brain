import type { EventObject } from "@/mvvm/sealos/event/models/event-object.model";
import type { EventResource } from "@/mvvm/sealos/event/models/event-resource.model";

// Convert EventResource to EventObject
const toObject = (event: EventResource): EventObject => {
	const { metadata, reason, type, message, firstTimestamp, lastTimestamp, count } = event;

	return {
		name: metadata.name || "unknown",
		resourceType: "event",
		reason: reason || "",
		type: type || "",
		message: message || "",
		firstTimestamp: firstTimestamp || "",
		lastTimestamp: lastTimestamp || "",
		count: count || 0,
	};
};

// Convert array of EventResource to array of EventObject
const toObjects = (events: EventResource[]): EventObject[] => {
	return events.map(toObject).filter((event) => event.name !== "unknown");
};

// Type for raw event data from tRPC response
type RawEventData = {
	metadata?: { name?: string };
	reason?: string;
	type?: string;
	message?: string;
	firstTimestamp?: string;
	lastTimestamp?: string;
	count?: number;
};

// Type for events record from tRPC response - use unknown[] for flexibility
type RawEventsRecord = Record<string, { events: unknown[]; success: boolean; error?: string }>;

// Process events record from tRPC response to simplified format
const processEventsRecord = (eventsRecord: RawEventsRecord) => {
	return Object.fromEntries(
		Object.entries(eventsRecord).map(([podName, podData]) => [
			podName,
			podData.events?.map((event: unknown) => {
				const eventData = event as RawEventData;
				return {
					name: eventData.metadata?.name || "unknown",
					reason: eventData.reason || "",
					type: eventData.type || "",
					message: eventData.message || "",
					firstTimestamp: eventData.firstTimestamp || "",
					lastTimestamp: eventData.lastTimestamp || "",
					count: eventData.count || 0,
				};
			}) || [],
		])
	);
};

export const eventParser = {
	toObject,
	toObjects,
	processEventsRecord,
};
