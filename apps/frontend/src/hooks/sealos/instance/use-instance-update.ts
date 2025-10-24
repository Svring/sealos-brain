"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export const useInstanceUpdate = () => {
	const { instance } = useTRPCClients();

	const mutation = useMutation(instance.update.mutationOptions());

	return mutation;
};
