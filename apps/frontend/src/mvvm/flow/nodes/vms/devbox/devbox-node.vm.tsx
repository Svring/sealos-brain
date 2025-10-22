"use client";

import { BaseNode } from "@/components/flow/nodes/base-node";
import { Spinner } from "@/components/ui/spinner";
import { useNodeClick } from "@/hooks/flow/use-node-click";
import { useDevboxObject } from "@/hooks/sealos/devbox/use-devbox-object";
import { DevboxNodeView } from "@/mvvm/flow/nodes/views/devbox/devbox-node.view";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s-custom.model";

interface DevboxNodeProps {
	data: {
		target: CustomResourceTarget;
	};
}

export function DevboxNode({ data: { target } }: DevboxNodeProps) {
	const { data, isLoading, isError, error } = useDevboxObject(target);
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

	return <DevboxNodeView data={data} onClick={handleNodeClick} />;
}
