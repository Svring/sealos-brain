"use client";

import { Globe, HardDrive, MoreHorizontal } from "lucide-react";
import { BaseNode } from "@/components/flow/nodes/base-node";
import NodeBackup from "@/components/flow/nodes/node-backup";
import NodeLog from "@/components/flow/nodes/node-log";
import NodeMonitor from "@/components/flow/nodes/node-monitor";
import NodeStatus from "@/components/flow/nodes/node-status";
import NodeTitle from "@/components/flow/nodes/node-title";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
	CLUSTER_ICON_BASE_URL,
} from "@/constants/cluster/cluster-icons.constant";
import { clusterParser } from "@/lib/sealos/cluster/cluster.parser";
import type { ClusterObject } from "@/mvvm/sealos/cluster/models/cluster-object.model";
import { ClusterMenuTrigger, ClusterMenuView } from "./cluster-menu.view";

interface ClusterNodeViewProps {
	data: ClusterObject;
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
}

export function ClusterNodeView({
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
}: ClusterNodeViewProps) {
	const { name, type, resource } = data;
	const storage = resource.storage;
	const hasPublicAccess = Array.isArray(data.connection.publicConnection);

	// Create icon URL using base URL and type
	const iconURL = `${CLUSTER_ICON_BASE_URL}/${type}.svg`;

	// Create target for node components
	const target = clusterParser.toTarget(name);

	return (
		<BaseNode>
			<div className="flex h-full flex-col gap-4 justify-between" onClick={onClick}>
				{/* Header with Name and Type */}
				<div className="flex items-center justify-between gap-2">
					<NodeTitle
						resourceType={type}
						name={name}
						iconURL={iconURL}
					/>

					{/* Actions Dropdown Menu */}
					<div className="flex flex-row items-center gap-2 flex-shrink-0">
						<DropdownMenu>
							<ClusterMenuTrigger>
								<div className="w-6 h-6 rounded hover:bg-muted cursor-pointer flex items-center justify-center">
									<MoreHorizontal className="h-4 w-4" />
								</div>
							</ClusterMenuTrigger>
							<ClusterMenuView
								clusterName={name}
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
							/>
						</DropdownMenu>
					</div>
				</div>

				{/* Public Access Status */}
				<div className="flex items-center gap-2 text-md px-1">
					<Globe
						className={`h-4 w-4 ${
							hasPublicAccess ? "text-theme-green" : "text-theme-gray"
						}`}
					/>
					<span
						className={
							hasPublicAccess ? "text-foreground" : "text-muted-foreground"
						}
					>
						Public Access
					</span>
				</div>

				{/* Bottom section with status and icons */}
				<div className="mt-auto flex justify-between items-center">
					{/* Left: Status component */}
					<NodeStatus target={target} />

					{/* Right: Action components */}
					<div className="flex items-center gap-2">
						<NodeLog target={target} />
						<NodeMonitor target={target} />
						<NodeBackup target={target} />
					</div>
				</div>
			</div>
		</BaseNode>
	);
}
