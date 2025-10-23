"use client";

import type { BuiltinResourceTarget } from "@sealos-brain/models/k8s";
import { Position } from "@xyflow/react";
import {
	Activity,
	NotebookText,
	Package,
	Pause,
	Play,
	RotateCcw,
	Trash2,
} from "lucide-react";
import * as BaseNode from "@/components/flow/nodes/base-node.comp";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useNodeClick } from "@/hooks/flow/use-node-click";
import { useResourceObject } from "@/hooks/resource/use-resource-object";
import { useLaunchpadDelete } from "@/hooks/sealos/launchpad/use-launchpad-delete";
import { useLaunchpadLifecycle } from "@/hooks/sealos/launchpad/use-launchpad-lifecycle";
import { LaunchpadObjectSchema } from "@/models/sealos/launchpad/launchpad-object.model";

interface LaunchpadNodeBlockProps {
	data: {
		id: string;
		target: BuiltinResourceTarget;
	};
}

export function LaunchpadNodeBlock({ data }: LaunchpadNodeBlockProps) {
	const { id, target } = data;
	const { data: object } = useResourceObject(target);
	const { handleNodeClick } = useNodeClick({
		id,
		resourceUid: object?.uid || "",
		target: target,
	});

	const { start, pause, restart, isPending } = useLaunchpadLifecycle();
	const { deleteLaunchpad, isPending: isDeleting } = useLaunchpadDelete();

	if (!object) {
		return (
			<BaseNode.Root target={target}>
				<BaseNode.Vessel onClick={handleNodeClick}>
					<BaseNode.Header>
						<BaseNode.Title />
					</BaseNode.Header>
					<BaseNode.Content>
						<div className="flex items-center justify-center h-full text-muted-foreground text-sm">
							No data available
						</div>
					</BaseNode.Content>
				</BaseNode.Vessel>
			</BaseNode.Root>
		);
	}

	const launchpad = LaunchpadObjectSchema.parse(object);

	const handleMonitorClick = () => {
		console.log("Monitor clicked for launchpad:", launchpad.name);
	};

	const handleStatusClick = () => {
		console.log("Status clicked for launchpad:", launchpad.name);
	};

	const handleLogClick = () => {
		console.log("Log analysis clicked for launchpad:", launchpad.name);
	};

	const handleDelete = async () => {
		if (
			window.confirm(
				`Are you sure you want to delete launchpad "${launchpad.name}"? This action cannot be undone.`,
			)
		) {
			await deleteLaunchpad(launchpad.name);
		}
	};

	return (
		<BaseNode.Root target={target}>
			<BaseNode.Handle position={Position.Top} type="source" />
			<BaseNode.Handle position={Position.Bottom} type="target" />
			<BaseNode.Vessel onClick={handleNodeClick}>
				<BaseNode.Header>
					<BaseNode.Title />
					<BaseNode.Menu>
						{launchpad.status !== "Running" && (
							<DropdownMenuItem
								onClick={() => start(launchpad.name)}
								disabled={launchpad.status === "Pending" || isPending.start}
								className={launchpad.status === "Pending" ? "opacity-50" : ""}
							>
								<Play className="mr-2 h-4 w-4" />
								Start
							</DropdownMenuItem>
						)}
						{launchpad.status !== "Stopped" &&
							launchpad.status !== "Shutdown" && (
								<DropdownMenuItem
									onClick={() => pause(launchpad.name)}
									disabled={launchpad.status === "Pending" || isPending.pause}
									className={launchpad.status === "Pending" ? "opacity-50" : ""}
								>
									<Pause className="mr-2 h-4 w-4" />
									Pause
								</DropdownMenuItem>
							)}
						<DropdownMenuItem
							onClick={() => restart(launchpad.name)}
							disabled={launchpad.status === "Pending" || isPending.restart}
							className={launchpad.status === "Pending" ? "opacity-50" : ""}
						>
							<RotateCcw className="mr-2 h-4 w-4" />
							Restart
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={handleDelete}
							className="text-destructive"
							disabled={isDeleting}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							{isDeleting ? "Deleting..." : "Delete"}
						</DropdownMenuItem>
					</BaseNode.Menu>
				</BaseNode.Header>

				<BaseNode.Content>
					<div className="flex items-center gap-2">
						<Package className="h-4 w-4 text-muted-foreground" />
						<div className="text-md text-muted-foreground truncate flex-1">
							Image: {launchpad.image.imageName}
						</div>
					</div>
				</BaseNode.Content>

				<BaseNode.Footer>
					<BaseNode.Status onClick={handleStatusClick} />
					<div className="flex items-center gap-2">
						<BaseNode.Widget
							icon={NotebookText}
							onClick={handleLogClick}
							tooltip="Analyze logs"
						/>
						<BaseNode.Widget
							icon={Activity}
							onClick={handleMonitorClick}
							tooltip="Analyze resource usage"
						/>
					</div>
				</BaseNode.Footer>
			</BaseNode.Vessel>
		</BaseNode.Root>
	);
}
