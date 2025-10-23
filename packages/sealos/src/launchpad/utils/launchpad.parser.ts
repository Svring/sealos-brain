import type { BuiltinResourceTarget } from "@sealos-brain/k8s/shared/models";
import type { DeploymentResource } from "../models/deployment/deployment-resource.model";
import type { StatefulSetResource } from "../models/statefulset/statefulset-resource.model";

export interface LaunchpadItem extends Record<string, unknown> {
	name: string;
	uid: string;
	image: string;
	resourceType: "deployment" | "statefulset";
}

const toItem = (
	resource: DeploymentResource | StatefulSetResource,
): LaunchpadItem => {
	// Determine resource type and extract image
	const isDeployment = resource.kind === "Deployment";
	const resourceType = isDeployment ? "deployment" : "statefulset";

	// Extract image from containers
	let image = "";
	if (isDeployment) {
		const deployment = resource as DeploymentResource;
		image = deployment.spec.template.spec.containers[0]?.image || "";
	} else {
		const statefulset = resource as StatefulSetResource;
		image = statefulset.spec.template.spec.containers[0]?.image || "";
	}

	return {
		name: resource.metadata.name,
		uid: resource.metadata.uid,
		image,
		resourceType: resourceType as "deployment" | "statefulset",
	};
};

const toTarget = (
	name: string,
	resourceType: "deployment" | "statefulset" = "deployment",
): BuiltinResourceTarget => {
	return {
		type: "builtin",
		resourceType,
		name,
	};
};

const toItems = (
	resources: (DeploymentResource | StatefulSetResource)[],
): LaunchpadItem[] => {
	return resources.map(toItem);
};

export const launchpadParser = {
	toItem,
	toTarget,
	toItems,
};
