"use client";

import { NotebookText } from "lucide-react";
import React from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ResourceTarget } from "@/mvvm/k8s/models/k8s.model";

interface NodeLogProps {
	target: ResourceTarget; // TODO: Define proper type
}

export default function NodeLog({ target }: NodeLogProps) {
	const analyzeLogs = () => {
		// TODO: Implement log analysis functionality
		console.log("Analyze logs clicked for target:", target);
	};

	const isLogsReady = true; // TODO: Implement proper readiness check

	if (!isLogsReady) {
		return (
			<button
				className="p-1 border-2 border-muted-foreground/20 rounded-full cursor-not-allowed opacity-50"
				type="button"
				disabled
			>
				<NotebookText className="h-4 w-4 text-theme-gray" />
			</button>
		);
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					className="p-1 border-2 border-muted-foreground/20 rounded-full transition-colors hover:border-muted-foreground/40 cursor-pointer"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						analyzeLogs();
					}}
					type="button"
				>
					<NotebookText className="h-4 w-4 text-theme-green" />
				</button>
			</TooltipTrigger>
			<TooltipContent>
				<p className="text-sm">Click to analyze logs</p>
			</TooltipContent>
		</Tooltip>
	);
}
