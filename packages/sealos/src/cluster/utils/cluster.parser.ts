import type { CustomResourceTarget } from "@sealos-brain/k8s/models";
import type { ClusterResource } from "@/cluster/models/cluster-resource.model";

export interface ClusterItem extends Record<string, unknown> {
	name: string;
	uid: string;
	type: string;
	resourceType: "cluster";
}

const toItem = (resource: ClusterResource): ClusterItem => {
	return {
		name: resource.metadata.name,
		uid: resource.metadata.uid,
		type: resource.spec.clusterDefinitionRef,
		resourceType: "cluster" as const,
	};
};

const toTarget = (name: string): CustomResourceTarget => {
	return {
		type: "custom",
		resourceType: "cluster",
		name,
	};
};

const toItems = (resources: ClusterResource[]): ClusterItem[] => {
	return resources.map(toItem);
};

export const clusterParser = {
	toItem,
	toTarget,
	toItems,
};
