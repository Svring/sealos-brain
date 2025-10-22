"use client";

import { MoreHorizontal, Package } from "lucide-react";
import { BaseNode } from "@/components/flow/nodes/base-node";
import NodeMonitor from "@/components/flow/nodes/node-monitor";
import NodeStatus from "@/components/flow/nodes/node-status";
import NodeTitle from "@/components/flow/nodes/node-title";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { DEVBOX_ICON_BASE_URL } from "@/constants/devbox/devbox-icons.constant";
import { devboxParser } from "@/lib/sealos/devbox/devbox.parser";
import { DevboxMenu } from "@/mvvm/flow/nodes/vms/devbox/devbox-menu.vm";
import type { DevboxObject } from "@/mvvm/sealos/devbox/models/devbox-object.model";
import { DevboxMenuTrigger } from "./devbox-menu.view";

interface DevboxNodeViewProps {
	data: DevboxObject;
	onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
	onDelete?: (devboxName: string) => void;
}

export function DevboxNodeView({
	data,
	onClick,
	onDelete,
}: DevboxNodeViewProps) {
	const { name, runtime, resourceType } = data;

	// Create target for node components
	const target = devboxParser.toTarget(name);

	const iconURL = `${DEVBOX_ICON_BASE_URL}/${runtime}.svg`;

	return (
		<BaseNode>
			<button
				className="flex h-full flex-col gap-2 justify-between w-full text-left cursor-pointer"
				onClick={onClick}
				type="button"
			>
				{/* Header with Name and Dropdown */}
				<div className="flex items-center justify-between">
					<NodeTitle
						resourceType={resourceType}
						name={name}
						iconURL={iconURL}
					/>

					{/* Actions Dropdown Menu */}
					<div className="flex flex-row items-center gap-2 flex-shrink-0">
						<DropdownMenu>
							<DevboxMenuTrigger>
								<button
									type="button"
									className="w-6 h-6 rounded hover:bg-muted cursor-pointer flex items-center justify-center"
								>
									<MoreHorizontal className="h-4 w-4" />
								</button>
							</DevboxMenuTrigger>
							<DevboxMenu object={data} onDelete={onDelete} />
						</DropdownMenu>
					</div>
				</div>

				{/* Image with Package Icon */}
				<div className="flex items-center gap-2 mt-2 px-1">
					<Package className="h-4 w-4 text-muted-foreground" />
					<div className="text-md text-muted-foreground truncate flex-1">
						Runtime: {runtime}
					</div>
				</div>

				{/* Bottom section with status and icons */}
				<div className="mt-auto flex justify-between items-center">
					{/* Left: Status component */}
					<NodeStatus target={target} />

					{/* Right: Action components */}
					<div className="flex items-center gap-2">
						<NodeMonitor target={target} />
					</div>
				</div>
			</button>
		</BaseNode>
	);
}
