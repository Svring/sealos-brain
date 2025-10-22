"use client";

import { AlertCircleIcon, Pause, Power, RotateCcw, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface LaunchpadMenuViewProps {
	name: string;
	status: string;
	showDeleteDialog: boolean;
	setShowDeleteDialog: (show: boolean) => void;
	deleteConfirmationValue: string;
	setDeleteConfirmationValue: (value: string) => void;
	handleDeleteClick: () => void;
	handleDeleteConfirm: () => void;
	executeAction: (action: string, name: string) => void;
	isPending: (action: string) => boolean;
	isDeleteConfirmationValid: boolean;
	showRestart?: boolean;
}

export function LaunchpadMenuTrigger({ children }: { children: React.ReactNode }) {
	return (
		<DropdownMenuTrigger asChild>
			{children}
		</DropdownMenuTrigger>
	);
}

export function LaunchpadMenuView({
	name,
	status,
	showDeleteDialog,
	setShowDeleteDialog,
	deleteConfirmationValue,
	setDeleteConfirmationValue,
	handleDeleteClick,
	handleDeleteConfirm,
	executeAction,
	isPending,
	isDeleteConfirmationValid,
	showRestart = true,
}: LaunchpadMenuViewProps) {
	const isRunning = status === "Running";
	const isPendingStatus = status === "Pending";

	return (
		<>
			<DropdownMenuContent
				className="rounded-xl bg-background-tertiary"
				align="start"
			>
				{!isRunning && !isPendingStatus && (
					<DropdownMenuItem
						onClick={() => executeAction("start", name)}
						disabled={isPendingStatus || isPending("start")}
						className={isPendingStatus ? "opacity-50" : ""}
					>
						<Power className="mr-2 h-4 w-4" />
						Start
					</DropdownMenuItem>
				)}
				{isRunning && (
					<DropdownMenuItem
						onClick={() => executeAction("pause", name)}
						disabled={isPendingStatus || isPending("pause")}
						className={isPendingStatus ? "opacity-50" : ""}
					>
						<Pause className="mr-2 h-4 w-4" />
						Pause
					</DropdownMenuItem>
				)}
				{isPendingStatus && (
					<>
						<DropdownMenuItem
							onClick={() => executeAction("start", name)}
							disabled={true}
							className="opacity-50"
						>
							<Power className="mr-2 h-4 w-4" />
							Start
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => executeAction("pause", name)}
							disabled={true}
							className="opacity-50"
						>
							<Pause className="mr-2 h-4 w-4" />
							Pause
						</DropdownMenuItem>
					</>
				)}
				{showRestart && (
					<DropdownMenuItem
						onClick={() => executeAction("restart", name)}
						disabled={isPendingStatus || isPending("restart")}
						className={isPendingStatus ? "opacity-50" : ""}
					>
						<RotateCcw className="mr-2 h-4 w-4" />
						Restart
					</DropdownMenuItem>
				)}
				<DropdownMenuItem
					onClick={handleDeleteClick}
					className="text-destructive"
					disabled={isPending("delete")}
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>

			<AlertDialog
				open={showDeleteDialog}
				onOpenChange={(open) => {
					// Prevent closing dialog while delete is in progress
					if (!open && isPending("delete")) {
						return;
					}
					setShowDeleteDialog(open);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Launchpad</AlertDialogTitle>
					</AlertDialogHeader>

					<Alert
						variant="destructive"
						className="bg-status-deleting text-red-700 border-none"
					>
						<AlertCircleIcon />
						<AlertDescription className="text-red-700!">
							This action cannot be undone and will permanently remove the
							launchpad and all its data.
						</AlertDescription>
					</Alert>

					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">
							Type the launchpad name{" "}
							<span className="font-semibold text-foreground">
								"{name}"
							</span>{" "}
							to confirm:
						</p>
						<Input
							value={deleteConfirmationValue}
							onChange={(e) => setDeleteConfirmationValue(e.target.value)}
							placeholder={name}
							className="w-full"
							autoFocus
						/>
						{deleteConfirmationValue && !isDeleteConfirmationValid && (
							<p className="text-sm text-destructive">
								Launchpad name does not match. Please type "{name}" to
								confirm.
							</p>
						)}
					</div>

					<AlertDialogFooter>
						<AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
							disabled={isPending("delete") || !isDeleteConfirmationValid}
							className="flex-1 bg-status-deleting/80 text-red-700! hover:bg-status-deleting! border border-status-error disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isPending("delete") ? "Deleting..." : "Confirm"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
