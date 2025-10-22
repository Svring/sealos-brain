"use client";

import { BaseNode } from "@/components/flow/nodes/base-node";
import { Spinner } from "@/components/ui/spinner";
import { useNodeClick } from "@/hooks/flow/use-node-click";
import { useLaunchpadObject } from "@/hooks/sealos/launchpad/use-launchpad-object";
import { LaunchpadNodeView } from "@/mvvm/flow/nodes/views/launchpad/launchpad-node.view";
import type { BuiltinResourceTarget } from "@/mvvm/k8s/models/k8s-builtin.model";

interface LaunchpadNodeProps {
	data: {
		target: BuiltinResourceTarget;
	};
}

export function LaunchpadNode({ data: { target } }: LaunchpadNodeProps) {
	const { data, isLoading, isError, error } = useLaunchpadObject(target);
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

	return <LaunchpadNodeView data={data} onClick={handleNodeClick} />;
}
