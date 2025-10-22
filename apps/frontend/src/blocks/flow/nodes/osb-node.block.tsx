"use client";

import { Copy, Globe, HardDrive } from "lucide-react";
import * as BaseNode from "@/components/flow/nodes/base-node.comp";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useResourceObject } from "@/hooks/resource/use-resource-object";
import type { CustomResourceTarget } from "@/models/k8s/k8s-custom.model";
import { OsbObjectSchema } from "@/models/sealos/osb/osb-object.model";

interface OsbNodeBlockProps {
	data: {
		target: CustomResourceTarget;
	};
}

export function OsbNodeBlock({ data }: OsbNodeBlockProps) {
	const { target } = data;
	const { data: object, isLoading } = useResourceObject(target);

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
		</BaseNode.Root>
	);
}
