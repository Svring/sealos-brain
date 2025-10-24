"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/trpc/hooks/use-trpc-clients";

export const useProxyCreate = () => {
	const { aiProxy } = useTRPCClients();

	const mutation = useMutation(aiProxy.create.mutationOptions());

	return mutation;
};
