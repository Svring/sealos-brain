"use client";

import { Cpu, CpuIcon, MemoryStick, MemoryStickIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CpuMemorySectionProps {
	onSectionClick: () => void;
	isActive?: boolean;
}

// Body Content Component
const CpuMemoryBodyContent: React.FC = () => {
	const [isEditing, setIsEditing] = useState(false);

	// Dummy data
	const cpuLimit = 2;
	const memoryLimit = 4;
	const cpuUsage = 0.8;
	const memoryUsage = 2.5;

	if (isEditing) {
		return (
			<div className="w-full rounded-lg space-y-3">
				{/* Dummy Edit Form */}
				<div className="space-y-3">
					<div className="flex flex-col gap-2">
						<label htmlFor="cpu-input" className="text-sm font-medium">
							CPU (Cores)
						</label>
						<input
							id="cpu-input"
							type="number"
							defaultValue={cpuLimit}
							className="w-full px-3 py-2 border rounded-md text-sm"
							min="0.5"
							step="0.5"
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label htmlFor="memory-input" className="text-sm font-medium">
							Memory (GB)
						</label>
						<input
							id="memory-input"
							type="number"
							defaultValue={memoryLimit}
							className="w-full px-3 py-2 border rounded-md text-sm"
							min="1"
							step="1"
						/>
					</div>
				</div>

				{/* Cancel and Confirm Buttons */}
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="flex-1"
						onClick={() => setIsEditing(false)}
					>
						Cancel
					</Button>
					<Button
						variant="default"
						size="sm"
						className="flex-1"
						onClick={() => setIsEditing(false)}
					>
						Confirm
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full rounded-lg space-y-3">
			{/* CPU and Memory Values Display */}
			<div className="flex items-center border p-2 rounded-lg justify-around">
				<div className="flex items-center gap-2">
					<CpuIcon className="h-6 w-6" />
					<div className="flex flex-col">
						<div className="text-xs text-muted-foreground">CPU</div>
						<div className="text-sm font-medium">{cpuLimit} Core</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<MemoryStickIcon className="h-6 w-6" />
					<div className="flex flex-col">
						<div className="text-xs text-muted-foreground">Memory</div>
						<div className="text-sm font-medium">{memoryLimit} GB</div>
					</div>
				</div>
			</div>

			{/* Usage Chart Placeholder */}
			<div className="border rounded-lg p-4 bg-background-tertiary">
				<div className="space-y-3">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">CPU Usage</span>
						<span className="font-medium">
							{cpuUsage} / {cpuLimit} Cores
						</span>
					</div>
					<div className="w-full bg-background-secondary rounded-full h-2">
						<div
							className="bg-primary h-2 rounded-full transition-all duration-300"
							style={{ width: `${(cpuUsage / cpuLimit) * 100}%` }}
						/>
					</div>

					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Memory Usage</span>
						<span className="font-medium">
							{memoryUsage} / {memoryLimit} GB
						</span>
					</div>
					<div className="w-full bg-background-secondary rounded-full h-2">
						<div
							className="bg-primary h-2 rounded-full transition-all duration-300"
							style={{ width: `${(memoryUsage / memoryLimit) * 100}%` }}
						/>
					</div>
				</div>
			</div>

			{/* Edit Button - Full Row */}
			<div className="w-full flex">
				<Button
					variant="outline"
					size="sm"
					className="flex-1"
					onClick={() => setIsEditing(true)}
				>
					Edit Resources
				</Button>
			</div>
		</div>
	);
};

export const DevboxCardCpuMemory: React.FC<CpuMemorySectionProps> & {
	BodyContent: React.FC;
} = ({ onSectionClick, isActive = false }) => {
	// Dummy data
	const cpuLimit = 2;
	const memoryLimit = 4;

	return (
		<button
			type="button"
			className={`p-2 border rounded-lg cursor-pointer hover:bg-background-tertiary transition-colors duration-200 ease-out w-full min-w-0 text-left ${
				isActive ? "bg-background-tertiary border-primary" : ""
			}`}
			onClick={onSectionClick}
		>
			<div className="flex gap-2 min-w-0">
				{/* CPU */}
				<div className="flex-1 flex items-center gap-2">
					<Cpu className="h-5 w-5" />
					<div className="flex flex-col">
						<span className="font-medium text-sm">CPU</span>
						<span className="text-xs font-mono font-semibold">
							{cpuLimit}Core
						</span>
					</div>
				</div>

				{/* Memory */}
				<div className="flex-1 flex items-center gap-2">
					<MemoryStick className="h-5 w-5" />
					<div className="flex flex-col">
						<span className="font-medium text-sm">Memory</span>
						<span className="text-xs font-mono font-semibold">
							{memoryLimit}GB
						</span>
					</div>
				</div>
			</div>
		</button>
	);
};

DevboxCardCpuMemory.BodyContent = CpuMemoryBodyContent;

export default DevboxCardCpuMemory;
