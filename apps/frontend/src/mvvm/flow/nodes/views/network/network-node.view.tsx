"use client";

import { Globe, HelpCircle } from "lucide-react";
import { BaseNode } from "@/components/flow/nodes/base-node";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ResourceTarget } from "@/mvvm/k8s/models/k8s.model";

interface NetworkPortData {
	port: {
		publicHost?: string;
		privateHost?: string;
	};
	publicReachable?: boolean;
	privateReachable?: boolean;
}

interface NetworkNodeViewProps {
	data: NetworkPortData[];
	target: ResourceTarget;
	onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export function NetworkNodeView({
	data,
	target,
	onClick,
}: NetworkNodeViewProps) {
	// Extract ports from network data
	const ports = data || [];

	// Get the first port with an address
	const firstPort = ports.find(
		(port) => port.port?.publicHost || port.port?.privateHost,
	);

	if (!firstPort) {
		return (
			<BaseNode height={14}>
				<div className="flex items-center justify-center h-full" onClick={onClick}>
					<div className="flex items-center justify-center gap-2 text-sm w-full">
						<Globe className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
						<span className="text-muted-foreground">No ports available</span>
					</div>
				</div>
			</BaseNode>
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
		<BaseNode height={14}>
			<div className="flex items-center justify-center h-full" onClick={onClick}>
				<div className="flex items-center justify-center gap-2 text-sm w-full">
					{!isReachable ? (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<HelpCircle className="h-4 w-4 cursor-help text-theme-yellow" />
								</TooltipTrigger>
								<TooltipContent side="bottom">
									<p>Network unreachable</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					) : (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Globe
										className={cn(
											"h-4 w-4 flex-shrink-0",
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
						</TooltipProvider>
					)}
					<span className="truncate min-w-0 flex-1 text-left">
						{displayUrl}
					</span>
				</div>
			</div>
		</BaseNode>
	);
}
