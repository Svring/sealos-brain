import { Square } from "lucide-react";
import React from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ResourceTarget } from "@/mvvm/k8s/models/k8s.model";

interface NodeStatusProps {
	target: ResourceTarget; // TODO: Define proper ResourceTarget type
}

export default function NodeStatus({ target }: NodeStatusProps) {
	const analyzeStatus = () => {
		// TODO: Implement status analysis functionality
		console.log("Status analysis clicked for target:", target);
	};

	const isStatusReady = true; // TODO: Implement proper readiness check

	// Mock status data - TODO: Replace with actual status fetching
	const status: string = "Running"; // TODO: Get from actual resource status
	const pods = []; // TODO: Get from actual pods data

	// Map status to colors
	const statusColors: { [key: string]: string } = {
		Running: "fill-theme-green text-theme-green",
		Stopped: "fill-theme-purple text-theme-purple",
		Stopping: "fill-theme-purple text-theme-purple",
		Shutdown: "fill-theme-purple text-theme-purple",
		Error: "fill-theme-red text-theme-red",
		Abnormal: "fill-theme-red text-theme-red",
		Deleting: "fill-theme-yellow text-theme-yellow",
		Restarting: "fill-theme-yellow text-theme-yellow",
		Pending: "fill-theme-gray text-theme-gray",
	};

	const colorClass =
		statusColors[status || "Pending"] || "fill-theme-gray text-theme-gray";
	const displayStatus =
		(status || "Pending") === "Stopping" ? "Pausing" : status || "Pending";

	const isRunning = (status || "Pending") === "Running";
	const isPending = (status || "Pending") === "Pending";

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div
					className="flex items-center gap-2 border border-dashed border-transparent hover:border-muted-foreground/50 rounded px-1 py-0.5 transition-colors cursor-pointer"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						if (isStatusReady) {
							analyzeStatus();
						}
					}}
				>
					<Square className={`h-3 w-3 ${colorClass}`} />
					<span className="text-sm">{displayStatus}</span>
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<p className="text-sm">Click to analyze status</p>
			</TooltipContent>
		</Tooltip>
	);
}
