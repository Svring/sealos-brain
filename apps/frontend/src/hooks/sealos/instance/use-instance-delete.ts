"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/trpc/hooks/use-trpc-clients";

export const useInstanceDelete = () => {
	const { instance } = useTRPCClients();

	const mutation = useMutation(instance.delete.mutationOptions());

	return mutation;
};
