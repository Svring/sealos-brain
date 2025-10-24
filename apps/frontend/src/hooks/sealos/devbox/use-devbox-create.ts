"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/trpc/hooks/use-trpc-clients";

export const useDevboxCreate = () => {
	const { devbox } = useTRPCClients();

	const mutation = useMutation(devbox.create.mutationOptions());

	return mutation;
};
