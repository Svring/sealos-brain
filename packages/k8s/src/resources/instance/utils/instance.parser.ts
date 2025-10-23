import type { CustomResourceTarget } from "@sealos-brain/k8s/shared/models";
import { INSTANCE_DISPLAY_NAME_ANNOTATION_KEY } from "../constants";
import type { InstanceObject } from "../models/instance-object.model";
import type { InstanceResource } from "../models/instance-resource.model";

// Convert InstanceResource to InstanceObject
const toObject = (instance: InstanceResource): InstanceObject => {
	const { metadata } = instance;

	// Get display name from annotations or fallback to name
	const displayName =
		metadata.annotations?.[INSTANCE_DISPLAY_NAME_ANNOTATION_KEY] ||
		metadata.name;

	return {
		name: metadata.name || "unknown",
		uid: metadata.uid || "",
		resourceType: "instance",
		displayName,
		createdAt: metadata.creationTimestamp || "",
	};
};

// Convert array of InstanceResource to array of InstanceObject
const toObjects = (instances: InstanceResource[]): InstanceObject[] => {
	return instances
		.map(toObject)
		.filter((instance) => instance.name !== "unknown");
};

// Convert InstanceResource or name to target for API operations
const toTarget = (name: string): CustomResourceTarget => {
	return {
		type: "custom",
		resourceType: "instance",
		name,
	};
};

export const instanceParser = {
	toObject,
	toObjects,
	toTarget,
};
