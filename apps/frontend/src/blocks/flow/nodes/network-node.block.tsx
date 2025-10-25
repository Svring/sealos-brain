"use client";

import type { CustomResourceTarget } from "@sealos-brain/k8s/shared/models";
import { cn } from "@sealos-brain/shared/misc/utils";
import { Position } from "@xyflow/react";
import { Globe, HelpCircle } from "lucide-react";
import * as BaseNode from "@/components/flow/nodes/base-node.comp";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNodeClick } from "@/hooks/flow/use-node-click";
import { useNetworkStatus } from "@/hooks/shared/network/use-network-status";

interface NetworkNodeBlockProps {
	data: {
		id: string;
		target: CustomResourceTarget;
	};
}

export function NetworkNodeBlock({ data }: NetworkNodeBlockProps) {
	const { id, target } = data;
	const { data: networkData, isLoading, isError } = useNetworkStatus(target);
	const { handleNodeClick } = useNodeClick({
		id,
		resourceUid: target.name,
		target: target,
	});

	// Extract ports from network data
	const ports = networkData || [];

	// Get the first port with an address
	const firstPort = ports.find(
		(port) => port.port?.publicHost || port.port?.privateHost,
	);

	// Show loading state for loading, error, or no ports
	if (isLoading || isError || !firstPort) {
		return (
			<BaseNode.Root target={target}>
				<BaseNode.Handle position={Position.Top} type="source" />
				<BaseNode.Handle position={Position.Bottom} type="target" />
				<BaseNode.Vessel size="flat" onClick={handleNodeClick}>
					<div className="flex items-center justify-center h-full">
						<div className="flex items-center justify-center gap-2 text-sm w-full">
							<Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
							<span className="text-muted-foreground">Loading...</span>
						</div>
					</div>
				</BaseNode.Vessel>
			</BaseNode.Root>
		);
	}

	const port = firstPort.port;
	const publicUrl = port.publicHost;
	const privateUrl = port.privateHost;
	const isPublicReachable = firstPort.publicReachable;
	const isPrivateReachable = firstPort.privateReachable;

	// Determine which URL to display (prefer public if available and reachable)
	const displayUrl =
		publicUrl && isPublicReachable
			? publicUrl
			: privateUrl && isPrivateReachable
				? privateUrl
				: publicUrl || privateUrl;

	const addressType = publicUrl && isPublicReachable ? "public" : "private";
	const isReachable = isPublicReachable || isPrivateReachable;

	return (
		<BaseNode.Root target={target}>
			<BaseNode.Handle position={Position.Top} type="source" />
			<BaseNode.Handle position={Position.Bottom} type="target" />
			<BaseNode.Vessel size="flat" onClick={handleNodeClick}>
				<div className="flex items-center justify-center h-full">
					<div className="flex items-center justify-center gap-2 text-sm w-full">
						{!isReachable ? (
							<Tooltip>
								<TooltipTrigger asChild>
									<HelpCircle className="h-4 w-4 cursor-help text-theme-yellow" />
								</TooltipTrigger>
								<TooltipContent side="bottom">
									<p>Network unreachable</p>
								</TooltipContent>
							</Tooltip>
						) : (
							<Tooltip>
								<TooltipTrigger asChild>
									<Globe
										className={cn(
											"h-4 w-4 shrink-0",
											addressType === "public"
												? "text-theme-green"
												: "text-theme-blue",
										)}
									/>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									<p>
										{addressType === "public"
											? "Accessible on public network"
											: "Cluster-range access only"}
									</p>
								</TooltipContent>
							</Tooltip>
						)}
						<span className="truncate min-w-0 flex-1 text-left">
							{displayUrl}
						</span>
					</div>
				</div>
			</BaseNode.Vessel>
		</BaseNode.Root>
	);
}
