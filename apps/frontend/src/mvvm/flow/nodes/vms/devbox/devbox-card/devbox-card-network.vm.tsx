"use client";

import { Check, Copy, ExternalLink, Network } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/utils/use-copy";

interface NetworkSectionProps {
	onSectionClick: () => void;
	isActive?: boolean;
}

// Body Content Component
const NetworkBodyContent: React.FC = () => {
	const [isEditing, setIsEditing] = useState(false);
	const { copyToClipboard, isCopied } = useCopy();

	// Dummy data
	const ports = [
		{
			number: 3000,
			portName: "web",
			protocol: "HTTP",
			privateAddress: "dev-box-01.ns-abc123.svc.cluster.local:3000",
			publicAddress: "dev-box-01-web.cloud.sealos.io",
		},
		{
			number: 8080,
			portName: "api",
			protocol: "HTTP",
			privateAddress: "dev-box-01.ns-abc123.svc.cluster.local:8080",
			publicAddress: "dev-box-01-api.cloud.sealos.io",
		},
		{
			number: 5432,
			portName: "database",
			protocol: "HTTP",
			privateAddress: "dev-box-01.ns-abc123.svc.cluster.local:5432",
			publicAddress: null,
		},
	];

	if (isEditing) {
		return (
			<div className="w-full rounded-lg min-w-0">
				<div className="space-y-3 min-w-0">
					{/* Dummy Edit Form */}
					<div className="space-y-3">
						{ports.map((port) => (
							<div
								key={port.portName}
								className="border rounded-lg p-3 space-y-2"
							>
								<div className="flex gap-2">
									<div className="flex-1">
										<label
											htmlFor={`port-name-${port.portName}`}
											className="text-xs text-muted-foreground"
										>
											Port Name
										</label>
										<input
											id={`port-name-${port.portName}`}
											type="text"
											defaultValue={port.portName}
											className="w-full px-2 py-1 border rounded text-sm mt-1"
										/>
									</div>
									<div className="flex-1">
										<label
											htmlFor={`port-number-${port.portName}`}
											className="text-xs text-muted-foreground"
										>
											Port Number
										</label>
										<input
											id={`port-number-${port.portName}`}
											type="number"
											defaultValue={port.number}
											className="w-full px-2 py-1 border rounded text-sm mt-1"
										/>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<input
										id={`expose-${port.portName}`}
										type="checkbox"
										defaultChecked={!!port.publicAddress}
									/>
									<label
										htmlFor={`expose-${port.portName}`}
										className="text-sm"
									>
										Expose Public Domain
									</label>
								</div>
							</div>
						))}
						<Button variant="outline" size="sm" className="w-full">
							+ Add Port
						</Button>
					</div>
				</div>

				{/* Cancel and Confirm Buttons */}
				<div className="flex gap-2 pt-3 border-t mt-3">
					<Button
						variant="outline"
						size="sm"
						className="flex-1 min-w-0"
						onClick={() => setIsEditing(false)}
					>
						Cancel
					</Button>
					<Button
						variant="default"
						size="sm"
						className="flex-1 min-w-0"
						onClick={() => setIsEditing(false)}
					>
						Confirm
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full rounded-lg min-w-0 max-h-[300px] flex flex-col">
			{/* Scrollable Table Content */}
			<div className="flex-1 overflow-y-auto min-h-0">
				<div className="min-w-0">
					<table className="w-full text-sm">
						<thead className="border-b">
							<tr className="text-xs text-muted-foreground">
								<th className="text-left py-2 px-2">Port</th>
								<th className="text-left py-2 px-2">Name</th>
								<th className="text-left py-2 px-2">Public URL</th>
								<th className="text-right py-2 px-2">Actions</th>
							</tr>
						</thead>
						<tbody>
							{ports.map((port) => (
								<tr
									key={`port-row-${port.portName}`}
									className="border-b last:border-0"
								>
									<td className="py-2 px-2 font-mono">{port.number}</td>
									<td className="py-2 px-2">{port.portName}</td>
									<td className="py-2 px-2">
										{port.publicAddress ? (
											<a
												href={`https://${port.publicAddress}`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-primary hover:underline flex items-center gap-1 truncate"
											>
												<span className="truncate max-w-[200px]">
													{port.publicAddress}
												</span>
												<ExternalLink className="h-3 w-3 flex-shrink-0" />
											</a>
										) : (
											<span className="text-muted-foreground text-xs">
												Private only
											</span>
										)}
									</td>
									<td className="py-2 px-2 text-right">
										<Button
											variant="ghost"
											size="sm"
											className="h-6 w-6 p-0"
											onClick={() => {
												const url = port.publicAddress || port.privateAddress;
												copyToClipboard(url, `port-${port.portName}`);
											}}
										>
											{isCopied(`port-${port.portName}`) ? (
												<Check className="h-3 w-3 text-theme-green" />
											) : (
												<Copy className="h-3 w-3" />
											)}
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Fixed Edit Button at Bottom */}
			<div className="w-full flex pt-3 border-t mt-3">
				<Button
					variant="outline"
					size="sm"
					className="flex-1 min-w-0"
					onClick={() => setIsEditing(true)}
				>
					Edit Ports
				</Button>
			</div>
		</div>
	);
};

export const DevboxCardNetwork: React.FC<NetworkSectionProps> & {
	BodyContent: React.FC;
} = ({ onSectionClick, isActive = false }) => {
	// Dummy data
	const portsCount = 3;

	return (
		<button
			type="button"
			className={`p-2 border rounded-lg cursor-pointer hover:bg-background-tertiary transition-colors duration-200 ease-out w-full min-w-0 flex-shrink-0 text-left ${
				isActive ? "bg-background-tertiary border-primary" : ""
			}`}
			onClick={onSectionClick}
		>
			<div className="flex items-center gap-2 min-w-0 w-full">
				<Network className="h-5 w-5 text-primary flex-shrink-0" />
				<div className="flex flex-col min-w-0 flex-1">
					<span className="font-medium text-sm truncate">Network</span>
					<span className="text-xs text-muted-foreground truncate">
						{portsCount} port{portsCount !== 1 ? "s" : ""}
					</span>
				</div>
			</div>
		</button>
	);
};

DevboxCardNetwork.BodyContent = NetworkBodyContent;

export default DevboxCardNetwork;
