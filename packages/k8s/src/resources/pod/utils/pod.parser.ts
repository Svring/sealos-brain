import type { PodObject } from "../models/pod-object.model";
import type { PodResource } from "../models/pod-resource.model";

// Convert PodResource to PodObject
const toObject = (pod: PodResource): PodObject => {
	const { metadata, spec, status } = pod;

	// Extract ports from containers
	const ports =
		spec.containers?.flatMap(
			(container) =>
				container.ports?.map((port) => ({
					name: port.name || "unnamed",
					containerPort: port.containerPort,
					protocol: port.protocol || "TCP",
					containerName: container.name,
				})) || [],
		) || [];

	// Extract resources from containers
	const resources =
		spec.containers?.map((container) => ({
			containerName: container.name,
			requests: container.resources?.requests || {},
			limits: container.resources?.limits || {},
		})) || [];

	// Extract container statuses
	const containerStatuses =
		status?.containerStatuses?.map((status) => ({
			name: status.name,
			ready: status.ready,
			restartCount: status.restartCount,
			started: status.started,
			state: status.state,
			lastState: status.lastState,
			containerID: status.containerID,
			image: status.image,
			imageID: status.imageID,
		})) || [];

	return {
		name: metadata.name || "unknown",
		resourceType: "pod",
		createdAt: metadata.creationTimestamp || null,
		ports,
		resources,
		containerStatuses,
	};
};

// Convert array of PodResource to array of PodObject
const toObjects = (pods: PodResource[]): PodObject[] => {
	return pods.map(toObject).filter((pod) => pod.name !== "unknown");
};

export const podParser = {
	toObject,
	toObjects,
};
