"use client";

import { BaseNode } from "@/components/flow/nodes/base-node";
import { Spinner } from "@/components/ui/spinner";
import { useNodeClick } from "@/hooks/flow/use-node-click";
import { useNetworkStatus } from "@/hooks/network/use-network-status";
import { NetworkNodeView } from "@/mvvm/flow/nodes/views/network/network-node.view";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s-custom.model";

interface NetworkNodeProps {
	data: {
		target: CustomResourceTarget;
	};
}

export function NetworkNode({ data: { target } }: NetworkNodeProps) {
	const { data, isLoading, isError, error } = useNetworkStatus(target);
	const { handleNodeClick } = useNodeClick({
		resourceUid: target.name, // Using name as uid for network nodes
		target: target,
	});

	if (isLoading) {
		return (
			<BaseNode height={14}>
				<div className="flex items-center justify-center h-full">
					<Spinner className="h-4 w-4" />
				</div>
			</BaseNode>
		);
	}

	if (isError) return <div>Error: {error?.message}</div>;
	if (!data) return <div>No data</div>;

	return (
		<NetworkNodeView data={data} target={target} onClick={handleNodeClick} />
	);
}
