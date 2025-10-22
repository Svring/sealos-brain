import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s-custom.model";
import type { ObjectStorageBucketResource } from "@/mvvm/sealos/osb/models/osb-resource.model";

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
