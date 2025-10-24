import type { CustomResourceTarget } from "@sealos-brain/k8s/shared/models";
import type { ObjectStorageBucketResource } from "@/osb/models";

export interface OsbItem extends Record<string, unknown> {
	name: string;
	uid: string;
	resourceType: "objectstoragebucket";
	displayName: string;
	policy: string;
}

/**
 * Convert ObjectStorageBucketResource to OsbItem
 */
const toItem = (resource: ObjectStorageBucketResource): OsbItem => {
	const { metadata, spec } = resource;

	// Get display name from annotations or fallback to name
	const displayName =
		metadata.annotations?.["sealos.io/display-name"] || metadata.name;

	return {
		name: metadata.name,
		uid: metadata.uid || "",
		resourceType: "objectstoragebucket",
		displayName,
		policy: spec.policy,
	};
};

/**
 * Convert ObjectStorageBucketResource, OsbObject, or string to target for API operations
 */
const toTarget = (name: string): CustomResourceTarget => {
	return {
		type: "custom",
		resourceType: "objectstoragebucket",
		name,
	};
};

/**
 * Convert array of ObjectStorageBucketResource to items
 */
const toItems = (resources: ObjectStorageBucketResource[]): OsbItem[] => {
	return resources.map(toItem);
};

export const osbParser = {
	toItem,
	toTarget,
	toItems,
};
