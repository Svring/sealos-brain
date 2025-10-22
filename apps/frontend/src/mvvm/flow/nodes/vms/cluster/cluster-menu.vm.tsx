"use client";

import { useState } from "react";
import { useClusterLifecycle } from "@/hooks/sealos/cluster/use-cluster-lifecycle";
import { ClusterMenuView } from "@/mvvm/flow/nodes/views/cluster/cluster-menu.view";
import type { ClusterObject } from "@/mvvm/sealos/cluster/models/cluster-object.model";

interface ClusterMenuProps {
	object: ClusterObject;
	onDelete?: (clusterName: string) => void;
}

export function ClusterMenu({ object, onDelete }: ClusterMenuProps) {
	const { name: clusterName, status } = object;
	const { mutate: executeAction, isPending } = useClusterLifecycle();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [deleteConfirmationValue, setDeleteConfirmationValue] = useState("");

	const handleDeleteClick = () => {
		setDeleteConfirmationValue("");
		setShowDeleteDialog(true);
	};

	const handleDeleteConfirm = () => {
		if (deleteConfirmationValue.trim() === clusterName) {
			executeAction("delete", clusterName);
			onDelete?.(clusterName);
			setShowDeleteDialog(false);
			setDeleteConfirmationValue("");
		}
	};

	const isDeleteConfirmationValid =
		deleteConfirmationValue.trim() === clusterName;

	return (
		<ClusterMenuView
			clusterName={clusterName}
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
		/>
	);
}
