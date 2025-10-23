import {
	BUILTIN_RESOURCES,
	CUSTOM_RESOURCES,
} from "@sealos-brain/constants/k8s";
import { clusterParser } from "@/lib/sealos/cluster/cluster.parser";
import { devboxParser } from "@/lib/sealos/devbox/devbox.parser";
import { instanceParser } from "@/lib/sealos/instance/instance.parser";
import { launchpadParser } from "@/lib/sealos/launchpad/launchpad.parser";
import { osbParser } from "@/lib/sealos/osb/osb.parser";
import type { ResourceTarget } from "@/mvvm/k8s/models/k8s.model";
import type { K8sItem } from "@/mvvm/k8s/models/k8s-resource.model";
import { K8sResourceSchema } from "@/mvvm/k8s/models/k8s-resource.model";
import { ClusterResourceSchema } from "@/mvvm/sealos/cluster/models/cluster-resource.model";
import { DevboxResourceSchema } from "@/mvvm/sealos/devbox/models/devbox-resource.model";
import { InstanceResourceSchema } from "@/mvvm/sealos/instance/models/instance-resource.model";
import { DeploymentResourceSchema } from "@/mvvm/sealos/launchpad/models/deployment/deployment-resource.model";
import { StatefulSetResourceSchema } from "@/mvvm/sealos/launchpad/models/statefulset/statefulset-resource.model";
import { ObjectStorageBucketResourceSchema } from "@/mvvm/sealos/osb/models/osb-resource.model";

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
