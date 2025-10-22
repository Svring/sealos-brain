"use client";

import { HardDrive, MoreHorizontal, Package } from "lucide-react";
import { BaseNode } from "@/components/flow/nodes/base-node";
import NodeLog from "@/components/flow/nodes/node-log";
import NodeMonitor from "@/components/flow/nodes/node-monitor";
import NodeStatus from "@/components/flow/nodes/node-status";
import NodeTitle from "@/components/flow/nodes/node-title";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { LAUNCHPAD_DEFAULT_ICON } from "@/constants/launchpad/launchpad-icons.constant";
import { launchpadParser } from "@/lib/sealos/launchpad/launchpad.parser";
import type { LaunchpadObject } from "@/mvvm/sealos/launchpad/models/launchpad-object.model";
import { LaunchpadMenuTrigger, LaunchpadMenuView } from "./launchpad-menu.view";

interface LaunchpadNodeViewProps {
	data: LaunchpadObject;
	onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
	status?: string;
	showDeleteDialog?: boolean;
	setShowDeleteDialog?: (show: boolean) => void;
	deleteConfirmationValue?: string;
	setDeleteConfirmationValue?: (value: string) => void;
	handleDeleteClick?: () => void;
	handleDeleteConfirm?: () => void;
	executeAction?: (action: string, name: string) => void;
	isPending?: (action: string) => boolean;
	isDeleteConfirmationValid?: boolean;
	showRestart?: boolean;
}

export function LaunchpadNodeView({
	data,
	onClick,
	status = "Running",
	showDeleteDialog = false,
	setShowDeleteDialog = () => {},
	deleteConfirmationValue = "",
	setDeleteConfirmationValue = () => {},
	handleDeleteClick = () => {},
	handleDeleteConfirm = () => {},
	executeAction = () => {},
	isPending = () => false,
	isDeleteConfirmationValid = false,
	showRestart = true,
}: LaunchpadNodeViewProps) {
	const { name, resourceType, image } = data;

	// Extract data based on resource type
	const iconURL = LAUNCHPAD_DEFAULT_ICON;

	const storage =
		data.resourceType === "statefulset"
			? (data.resource as { storage: number }).storage || 20
			: undefined;

	// Create target for node components
	const target = launchpadParser.toTarget(name, resourceType);

	return (
		<BaseNode>
			<div
				className="flex h-full flex-col gap-2 justify-between"
				onClick={onClick}
			>
				{/* Header with Name and Dropdown */}
				<div className="flex items-center justify-between gap-2">
					<NodeTitle
						resourceType={data.resourceType}
						name={name}
						iconURL={iconURL}
					/>

					{/* Actions Dropdown Menu */}
					<div className="flex flex-row items-center gap-2 flex-shrink-0">
						<DropdownMenu>
							<LaunchpadMenuTrigger>
								<div className="w-6 h-6 rounded hover:bg-muted cursor-pointer flex items-center justify-center">
									<MoreHorizontal className="h-4 w-4" />
								</div>
							</LaunchpadMenuTrigger>
							<LaunchpadMenuView
								name={name}
								status={status}
								showDeleteDialog={showDeleteDialog}
								setShowDeleteDialog={setShowDeleteDialog}
								deleteConfirmationValue={deleteConfirmationValue}
								setDeleteConfirmationValue={setDeleteConfirmationValue}
								handleDeleteClick={handleDeleteClick}
								handleDeleteConfirm={handleDeleteConfirm}
								executeAction={executeAction}
								isPending={isPending}
								isDeleteConfirmationValid={isDeleteConfirmationValid}
								showRestart={showRestart}
							/>
						</DropdownMenu>
					</div>
				</div>

				{/* Image with Package Icon */}
				<div className="flex items-center gap-2 mt-2 px-1">
					<Package className="h-4 w-4 text-muted-foreground" />
					<div className="text-md text-muted-foreground truncate flex-1">
						Image: {image.imageName}
					</div>
				</div>

				{/* Bottom section with status and icons */}
				<div className="mt-auto flex justify-between items-center">
					{/* Left: Status component */}
					<NodeStatus target={target} />

					{/* Right: Action components */}
					<div className="flex items-center gap-2">
						<NodeLog target={target} />
						<NodeMonitor target={target} />
					</div>
				</div>

				{/* Storage Volume Bar - Only for StatefulSet */}
				{data.resourceType === "statefulset" && storage && (
					<div className="relative bg-node-background w-full h-full flex items-center rounded-b-xl text-xs text-muted-foreground overflow-hidden px-2 py-1">
						<div className="relative z-10 flex items-center justify-between w-full">
							<div className="flex items-center gap-1">
								<HardDrive className="h-5 w-5" />
								<span className="text-md">Storage</span>
							</div>
							<div className="text-xs">{storage}GB</div>
						</div>
					</div>
				)}
			</div>
		</BaseNode>
	);
}
