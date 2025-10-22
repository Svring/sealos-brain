"use client";

import { DatabaseBackup } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s.model";

interface NodeBackupProps {
	target: CustomResourceTarget;
}

export default function NodeBackup({ target }: NodeBackupProps) {
	const handleNodeSelect = () => {
		// TODO: Implement backup functionality
		console.log("Backup clicked for target:", target);
	};

	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<TooltipTrigger asChild>
					<div
						className="p-1 border-2 border-muted-foreground/20 rounded-full cursor-pointer hover:border-muted-foreground/40 transition-colors"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							handleNodeSelect();
						}}
					>
						<DatabaseBackup className="h-4 w-4 text-theme-green" />
					</div>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<p className="font-medium">View backups</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
