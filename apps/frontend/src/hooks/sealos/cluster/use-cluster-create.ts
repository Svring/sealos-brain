"use client";

import { clusterParser } from "@sealos-brain/sealos/cluster/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queires";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export const useClusterCreate = () => {
	const { cluster } = useTRPCClients();
	const { invalidateQueries } = useInvalidateQueries();

	const mutation = useMutation({
		...cluster.create.mutationOptions(),
		onSuccess: (_, variables) => {
			invalidateQueries([
				cluster.get.queryKey(clusterParser.toTarget(variables.name)),
			]);
			toast.success(`Cluster ${variables.name} created successfully`);
		},
		onError: (error) => {
			toast.error(`Failed to create cluster: ${error.message}`);
		},
	});

	return mutation;
};
