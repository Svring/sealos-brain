"use client";

import { Copy, Globe, MoreHorizontal } from "lucide-react";
import React from "react";
import { BaseNode } from "@/components/flow/nodes/base-node";
import NodeTitle from "@/components/flow/nodes/node-title";
import { Switch } from "@/components/ui/switch";
import { OBJECTSTORAGE_DEFAULT_ICON } from "@/constants/osb/osb-icons.constant";
import { osbParser } from "@/lib/sealos/osb/osb.parser";
import type { OsbObject } from "@/mvvm/sealos/osb/models/osb-object.model";

interface OSBNodeViewProps {
	data: OsbObject;
	onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export function OSBNodeView({ data, onClick }: OSBNodeViewProps) {
	const { name, policy } = data;
	const [staticHosting, setStaticHosting] = React.useState(false);

	// Create target for node components
	const target = osbParser.toTarget(name);

	const hemComponent = policy !== "private" && (
		<div className="flex items-center justify-between gap-2">
			<div className="flex items-center gap-2">
				<Globe className="h-4 w-4 text-muted-foreground" />
				<span className="text-sm text-muted-foreground">Static Hosting</span>
				<Switch
					checked={staticHosting}
					onCheckedChange={setStaticHosting}
					className="scale-75"
				/>
			</div>
			<button
				type="button"
				className="h-6 w-6 p-0 hover:bg-muted rounded transition-colors flex items-center justify-center"
				onClick={(e) => e.stopPropagation()}
			>
				<Copy className="h-3 w-3" />
			</button>
		</div>
	);

	return (
		<BaseNode>
			<div className="flex h-full flex-col gap-2 justify-between" onClick={onClick}>
				{/* Header with Name and Dropdown */}
				<div className="flex items-center justify-between">
					<NodeTitle
						resourceType="object storage"
						name={name}
						iconURL={OBJECTSTORAGE_DEFAULT_ICON}
					/>

					{/* Actions Dropdown Menu - Simulated */}
					<div className="flex flex-row items-center gap-2 flex-shrink-0">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
							}}
							className="p-1 hover:bg-muted rounded transition-colors"
						>
							<MoreHorizontal className="h-4 w-4" />
						</button>
					</div>
				</div>

				{/* Policy Badge */}
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						<div
							className={`w-2 h-2 rounded-full ${
								policy === "private" ? "bg-red-500" : "bg-green-500"
							}`}
						></div>
						<span className="text-xs text-muted-foreground capitalize">
							{policy}
						</span>
					</div>
				</div>

				{/* Static Hosting Section - Only show if not private */}
				{hemComponent && <div className="mt-auto">{hemComponent}</div>}
			</div>
		</BaseNode>
	);
}
