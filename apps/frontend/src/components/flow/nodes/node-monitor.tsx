"use client";

import { Activity } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ResourceTarget } from "@/mvvm/k8s/models/k8s.model";

interface NodeMonitorProps {
	target: ResourceTarget; // TODO: Define proper type
}

export default function NodeMonitor({ target }: NodeMonitorProps) {
	const diagnoseMonitor = () => {
		// TODO: Implement monitor diagnosis functionality
		console.log("Monitor diagnosis clicked for target:", target);
	};

	const isMonitorReady = true; // TODO: Implement proper readiness check
	const color = "text-theme-green"; // TODO: Implement dynamic color based on status

	if (!isMonitorReady) {
		return (
			<div className="p-1 border-2 border-muted-foreground/20 rounded-full cursor-not-allowed opacity-50">
				<Activity className="h-4 w-4 text-theme-gray" />
			</div>
		);
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div
					className="p-1 border-2 border-muted-foreground/20 rounded-full transition-colors cursor-pointer hover:border-muted-foreground/40"
					onClick={(e) => {
						e.stopPropagation();
						diagnoseMonitor();
					}}
				>
					<Activity className={`h-4 w-4 ${color}`} />
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<p className="text-sm">Click to check usage</p>
			</TooltipContent>
		</Tooltip>
	);
}
