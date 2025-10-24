"use client";

import { clusterParser } from "@sealos-brain/sealos/cluster/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/trpc/hooks/use-trpc-clients";

export const useClusterBackup = () => {
	const { cluster } = useTRPCClients();

	const createBackupMutation = useMutation(
		cluster.createBackup.mutationOptions(),
	);
	const deleteBackupMutation = useMutation(
		cluster.deleteBackup.mutationOptions(),
	);
	const restoreBackupMutation = useMutation(
		cluster.restoreBackup.mutationOptions(),
	);

	const createBackup = async (databaseName: string, remark?: string) => {
		return await createBackupMutation.mutateAsync({ databaseName, remark });
	};

	const deleteBackup = async (clusterName: string, backupName: string) => {
		return await deleteBackupMutation.mutateAsync({ clusterName, backupName });
	};

	const restoreBackup = async (databaseName: string, backupName: string) => {
		return await restoreBackupMutation.mutateAsync({
			databaseName,
			backupName,
		});
	};

	return {
		createBackup,
		deleteBackup,
		restoreBackup,
		isCreating: createBackupMutation.isPending,
		isDeleting: deleteBackupMutation.isPending,
		isRestoring: restoreBackupMutation.isPending,
	};
};

export const useClusterBackups = (clusterName: string) => {
	const { cluster } = useTRPCClients();

	const target = clusterParser.toTarget(clusterName);

	const query = useQuery(cluster.backups.queryOptions(target));

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
};
