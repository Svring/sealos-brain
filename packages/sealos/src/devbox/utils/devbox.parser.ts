import type { CustomResourceTarget } from "@sealos-brain/k8s/shared/models";
import type { DevboxResource } from "../models/devbox-resource.model";

export interface DevboxItem extends Record<string, unknown> {
	name: string;
	uid: string;
	runtime: string;
	resourceType: "devbox";
}

const toItem = (resource: DevboxResource): DevboxItem => {
	// Extract runtime from image similar to DevboxBridgeSchema
	const image = resource.spec.image || "";
	// @ts-expect-error
	const imageName = image.split(":")[0].split("/").pop() || "";
	const runtime = imageName.split("-").slice(0, 1).join("-");

	return {
		name: resource.metadata.name,
		uid: resource.metadata.uid,
		runtime,
		resourceType: "devbox" as const,
	};
};

const toTarget = (name: string): CustomResourceTarget => {
	return {
		type: "custom",
		resourceType: "devbox",
		name,
	};
};

const toItems = (resources: DevboxResource[]): DevboxItem[] => {
	return resources.map(toItem);
};

export const devboxParser = {
	toItem,
	toTarget,
	toItems,
};
