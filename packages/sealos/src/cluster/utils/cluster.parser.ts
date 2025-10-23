import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s-custom.model";
import type { ClusterResource } from "@/mvvm/sealos/cluster/models/cluster-resource.model";

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
