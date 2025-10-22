"use client";

import { useState } from "react";
import { useLaunchpadLifecycle } from "@/hooks/sealos/launchpad/use-launchpad-lifecycle";
import { LaunchpadMenuView } from "@/mvvm/flow/nodes/views/launchpad/launchpad-menu.view";
import type { LaunchpadObject } from "@/mvvm/sealos/launchpad/models/launchpad-object.model";

interface LaunchpadMenuProps {
	object: LaunchpadObject;
	onDelete?: (name: string) => void;
	showRestart?: boolean;
}

export function LaunchpadMenu({ object, onDelete, showRestart = true }: LaunchpadMenuProps) {
	const { name, status } = object;
	const { executeAction, isPending } = useLaunchpadLifecycle();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [deleteConfirmationValue, setDeleteConfirmationValue] = useState("");

	const handleDeleteClick = () => {
		setDeleteConfirmationValue("");
		setShowDeleteDialog(true);
	};

	const handleDeleteConfirm = async () => {
		if (deleteConfirmationValue.trim() === name) {
			try {
				await executeAction("delete", name);
				onDelete?.(name);
				setShowDeleteDialog(false);
				setDeleteConfirmationValue("");
			} catch (error) {
				// Error is already handled by the mutation, just keep dialog open
				console.error("Delete failed:", error);
			}
		}
	};

	const isDeleteConfirmationValid = deleteConfirmationValue.trim() === name;

	return (
		<LaunchpadMenuView
			name={name}
			status={status}
			showDeleteDialog={showDeleteDialog}
			setShowDeleteDialog={setShowDeleteDialog}
			deleteConfirmationValue={deleteConfirmationValue}
			setDeleteConfirmationValue={setDeleteConfirmationValue}
			handleDeleteClick={handleDeleteClick}
			handleDeleteConfirm={handleDeleteConfirm}
			executeAction={executeAction}
			isPending={isPending}
			isDeleteConfirmationValid={isDeleteConfirmationValid}
			showRestart={showRestart}
		/>
	);
}
