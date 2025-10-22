"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export const useClusterCreate = () => {
	const { cluster } = useTRPCClients();

	const mutation = useMutation(cluster.create.mutationOptions());

	return mutation;
};
