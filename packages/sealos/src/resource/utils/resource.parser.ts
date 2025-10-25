import { InstanceResourceSchema } from "@sealos-brain/k8s/resources/instance/models";
import { instanceParser } from "@sealos-brain/k8s/resources/instance/utils";
import {
	BUILTIN_RESOURCES,
	CUSTOM_RESOURCES,
} from "@sealos-brain/k8s/shared/constants";
import type { K8sItem, ResourceTarget } from "@sealos-brain/k8s/shared/models";
import { K8sResourceSchema } from "@sealos-brain/k8s/shared/models";
import { ClusterResourceSchema } from "#cluster/models";
import { clusterParser } from "#cluster/utils";
import { DevboxResourceSchema } from "#devbox/models";
import { devboxParser } from "#devbox/utils";
import {
	DeploymentResourceSchema,
	StatefulSetResourceSchema,
} from "#launchpad/models";
import { launchpadParser } from "#launchpad/utils";
import { ObjectStorageBucketResourceSchema } from "#osb/models";
import { osbParser } from "#osb/utils";

const toTarget = (resource: unknown): ResourceTarget => {
	if (typeof resource !== "object" || resource === null) {
		throw new Error(`Invalid resource format: ${JSON.stringify(resource)}`);
	}

	const obj = resource as Record<string, unknown>;
	const metadata =
		typeof obj.metadata === "object" && obj.metadata !== null
			? (obj.metadata as Record<string, unknown>)
			: undefined;

	const name =
		typeof obj.name === "string"
			? obj.name
			: typeof metadata?.name === "string"
				? metadata.name
				: undefined;

	const typeCandidate =
		typeof obj.resourceType === "string"
			? obj.resourceType
			: typeof obj.kind === "string"
				? obj.kind
				: undefined;

	const resourceType = typeCandidate?.toLowerCase();

	if (!name || !resourceType) {
		throw new Error(`Invalid resource format: ${JSON.stringify(resource)}`);
	}

	const builtin = BUILTIN_RESOURCES[resourceType];
	if (builtin) {
		return { type: "builtin", resourceType: builtin.resourceType, name };
	}

	const custom = CUSTOM_RESOURCES[resourceType];
	if (custom) {
		return { type: "custom", resourceType: custom.resourceType, name };
	}

	throw new Error(`Unknown resource type: ${resourceType}`);
};

const toItem = (resource: unknown): K8sItem => {
	const resourceResult = K8sResourceSchema.safeParse(resource);
	if (resourceResult.success) {
		const k8sResource = resourceResult.data;
		const target = toTarget(k8sResource);

		try {
			switch (target.resourceType) {
				case "cluster": {
					const clusterData = ClusterResourceSchema.parse(k8sResource);
					return clusterParser.toItem(clusterData);
				}
				case "devbox": {
					const devboxData = DevboxResourceSchema.parse(k8sResource);
					return devboxParser.toItem(devboxData);
				}
				case "instance": {
					const instanceData = InstanceResourceSchema.parse(k8sResource);
					return instanceParser.toObject(instanceData);
				}
				case "objectstoragebucket": {
					const osbData = ObjectStorageBucketResourceSchema.parse(k8sResource);
					return osbParser.toItem(osbData);
				}
				case "deployment": {
					const deploymentData = DeploymentResourceSchema.parse(k8sResource);
					return launchpadParser.toItem(deploymentData);
				}
				case "statefulset": {
					const statefulsetData = StatefulSetResourceSchema.parse(k8sResource);
					return launchpadParser.toItem(statefulsetData);
				}
			}
		} catch {}

		return {
			name: k8sResource.metadata.name || "unknown",
			uid: k8sResource.metadata.uid || "",
			resourceType: k8sResource.kind?.toLowerCase() || "unknown",
		};
	}

	throw new Error(`Invalid resource format: ${JSON.stringify(resource)}`);
};

const toItems = (resources: unknown[]): K8sItem[] =>
	resources.map((resource) => toItem(resource));

const toTargets = (resources: unknown[]): ResourceTarget[] =>
	resources.map((resource) => toTarget(resource));

export const resourceParser = {
	toTarget,
	toItem,
	toItems,
	toTargets,
};
