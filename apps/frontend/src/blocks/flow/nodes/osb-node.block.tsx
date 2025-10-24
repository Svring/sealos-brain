"use client";

import type { CustomResourceTarget } from "@sealos-brain/models/k8s";
import { OsbObjectSchema } from "@sealos-brain/sealos/osb/models";
import { Copy, Globe, HardDrive } from "lucide-react";
import * as BaseNode from "@/components/flow/nodes/base-node.comp";
import { Switch } from "@/components/ui/switch";
import { useNodeClick } from "@/hooks/flow/use-node-click";
import { useResourceObject } from "@/hooks/shared/resource/use-resource-object";

interface OsbNodeBlockProps {
	data: {
		id: string;
		target: CustomResourceTarget;
	};
}

export function OsbNodeBlock({ data }: OsbNodeBlockProps) {
	const { id, target } = data;
	const { data: object } = useResourceObject(target);
	const { handleNodeClick } = useNodeClick({
		id,
		resourceUid: object?.uid || "",
		target: target,
	});

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

	const osb = OsbObjectSchema.parse(object);

	const isPublic = osb.policy !== "private";

	const handleStatusClick = () => {
		console.log("Status clicked for OSB:", osb.name);
	};

	const handleCopyClick = () => {
		console.log("Copy access key for OSB:", osb.name);
		// Copy access key to clipboard
		if (osb.access?.accessKey) {
			navigator.clipboard.writeText(osb.access?.accessKey);
		}
	};

	const handleStorageClick = () => {
		console.log("Storage management for OSB:", osb.name);
	};

	return (
		<BaseNode.Root target={target}>
			<BaseNode.Vessel onClick={handleNodeClick}>
				<BaseNode.Header>
					<BaseNode.Title />
				</BaseNode.Header>

				<BaseNode.Content>
					{isPublic && (
						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<Globe className="h-4 w-4 text-theme-green" />
								<span className="text-sm text-muted-foreground">
									Static Hosting
								</span>
								<Switch checked={true} disabled className="scale-75" />
							</div>
							<BaseNode.Widget
								icon={Copy}
								onClick={handleCopyClick}
								tooltip="Copy access key"
							/>
						</div>
					)}
					{!isPublic && (
						<div className="flex items-center gap-2">
							<Globe className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">
								Private Storage
							</span>
						</div>
					)}
				</BaseNode.Content>

				<BaseNode.Footer>
					<BaseNode.Status onClick={handleStatusClick} />
					<BaseNode.Widget
						icon={HardDrive}
						onClick={handleStorageClick}
						tooltip="Storage management"
					/>
				</BaseNode.Footer>
			</BaseNode.Vessel>
		</BaseNode.Root>
	);
}
