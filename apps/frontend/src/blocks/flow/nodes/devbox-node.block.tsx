"use client";

import { Position } from "@xyflow/react";
import {
	Activity,
	Package,
	Pause,
	Play,
	RotateCcw,
	Trash2,
} from "lucide-react";
import * as BaseNode from "@/components/flow/nodes/base-node.comp";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { useResourceObject } from "@/hooks/resource/use-resource-object";
import { useDevboxDelete } from "@/hooks/sealos/devbox/use-devbox-delete";
import { useDevboxLifecycle } from "@/hooks/sealos/devbox/use-devbox-lifecycle";
import type { CustomResourceTarget } from "@/models/k8s/k8s-custom.model";
import { DevboxObjectSchema } from "@/models/sealos/devbox/devbox-object.model";

interface DevboxNodeBlockProps {
	data: {
		target: CustomResourceTarget;
	};
}

export function DevboxNodeBlock({ data }: DevboxNodeBlockProps) {
	const { target } = data;
	const { data: object, isLoading } = useResourceObject(target);

	const { start, pause, restart, isPending } = useDevboxLifecycle();
	const { del, isPending: isDeleting } = useDevboxDelete();

	if (isLoading || !object) {
		return (
			<BaseNode.Root target={target}>
				<BaseNode.Header>
					<BaseNode.Title />
				</BaseNode.Header>
				<BaseNode.Content>
					<Spinner className="h-4 w-4" />
				</BaseNode.Content>
			</BaseNode.Root>
		);
	}

	const devbox = DevboxObjectSchema.parse(object);

	const handleMonitorClick = () => {
		console.log("Monitor clicked for devbox:", devbox.name);
	};

	const handleStatusClick = () => {
		console.log("Status clicked for devbox:", devbox.name);
	};

	const handleDelete = async () => {
		if (
			window.confirm(
				`Are you sure you want to delete devbox "${devbox.name}"? This action cannot be undone.`,
			)
		) {
			await del(devbox.name);
		}
	};

	return (
		<BaseNode.Root target={target}>
			<BaseNode.Handle position={Position.Top} type="source" />
			<BaseNode.Handle position={Position.Bottom} type="target" />
			<BaseNode.Header>
				<BaseNode.Title />
				<BaseNode.Menu>
					{devbox.status !== "Running" && (
						<DropdownMenuItem
							onClick={() => start(devbox.name)}
							disabled={devbox.status === "Pending" || isPending.start}
							className={devbox.status === "Pending" ? "opacity-50" : ""}
						>
							<Play className="mr-2 h-4 w-4" />
							Start
						</DropdownMenuItem>
					)}
					{devbox.status !== "Stopped" && devbox.status !== "Shutdown" && (
						<DropdownMenuItem
							onClick={() => pause(devbox.name)}
							disabled={devbox.status === "Pending" || isPending.pause}
							className={devbox.status === "Pending" ? "opacity-50" : ""}
						>
							<Pause className="mr-2 h-4 w-4" />
							Pause
						</DropdownMenuItem>
					)}
					<DropdownMenuItem
						onClick={() => restart(devbox.name)}
						disabled={devbox.status === "Pending" || isPending.restart}
						className={devbox.status === "Pending" ? "opacity-50" : ""}
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
						Runtime: {devbox.runtime}
					</div>
				</div>
			</BaseNode.Content>

			<BaseNode.Footer>
				<BaseNode.Status onClick={handleStatusClick} />
				<BaseNode.Widget
					icon={Activity}
					onClick={handleMonitorClick}
					tooltip="Analyze resource usage"
				/>
			</BaseNode.Footer>
		</BaseNode.Root>
	);
}
