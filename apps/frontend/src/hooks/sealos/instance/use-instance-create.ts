"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/trpc/hooks/use-trpc-clients";

export const useInstanceCreate = () => {
	const { instance } = useTRPCClients();

	const mutation = useMutation(instance.create.mutationOptions());

	return mutation;
};
