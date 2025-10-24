"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/trpc/hooks/use-trpc-clients";

export const useClusterUpdate = () => {
	const { cluster } = useTRPCClients();

	const mutation = useMutation(cluster.update.mutationOptions());

	return mutation;
};
