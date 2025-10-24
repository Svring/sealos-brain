"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/trpc/hooks/use-trpc-clients";

export const useClusterAccess = () => {
	const { cluster } = useTRPCClients();

	const enablePublicMutation = useMutation(cluster.enablePublic.mutationOptions());
	const disablePublicMutation = useMutation(cluster.disablePublic.mutationOptions());

	const enablePublicAccess = async (databaseName: string) => {
		return await enablePublicMutation.mutateAsync({ databaseName });
	};

	const disablePublicAccess = async (databaseName: string) => {
		return await disablePublicMutation.mutateAsync({ databaseName });
	};

	return {
		enablePublicAccess,
		disablePublicAccess,
		isEnabling: enablePublicMutation.isPending,
		isDisabling: disablePublicMutation.isPending,
	};
};
