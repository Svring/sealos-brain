"use client";

import { BaseNode } from "@/components/flow/nodes/base-node";
import { Spinner } from "@/components/ui/spinner";
import { useNodeClick } from "@/hooks/flow/use-node-click";
import { useClusterObject } from "@/hooks/sealos/cluster/use-cluster-object";
import { ClusterNodeView } from "@/mvvm/flow/nodes/views/cluster/cluster-node.view";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s-custom.model";

interface ClusterNodeProps {
	data: {
		target: CustomResourceTarget;
	};
}

export function ClusterNode({ data: { target } }: ClusterNodeProps) {
	const { data, isLoading, isError, error } = useClusterObject(target);
	const { handleNodeClick } = useNodeClick({
		resourceUid: data?.uid || "",
		target: target,
	});

	if (isLoading) {
		return (
			<BaseNode>
				<div className="flex items-center justify-center h-full">
					<Spinner className="h-4 w-4" />
				</div>
			</BaseNode>
		);
	}

	if (isError) return <div>Error: {error?.message}</div>;
	if (!data) return <div>No data</div>;

	return <ClusterNodeView data={data} onClick={handleNodeClick} />;
}
