"use client";

import { useNodeClick } from "@/hooks/flow/use-node-click";
import { useOsbObject } from "@/hooks/sealos/osb/use-osb-object";
import { OSBNodeView } from "@/mvvm/flow/nodes/views/osb/osb-node.view";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s-custom.model";

interface OsbNodeProps {
	data: {
		target: CustomResourceTarget;
	};
}

export function OsbNode({ data: { target } }: OsbNodeProps) {
	const { data, isLoading, isError, error } = useOsbObject(target);
	const { handleNodeClick } = useNodeClick({
		resourceUid: data?.uid || "",
		target: target,
	});

	if (isLoading) return <div>Loading...</div>;
	if (isError) return <div>Error: {error?.message}</div>;
	if (!data) return <div>No data</div>;

	return <OSBNodeView data={data} onClick={handleNodeClick} />;
}
