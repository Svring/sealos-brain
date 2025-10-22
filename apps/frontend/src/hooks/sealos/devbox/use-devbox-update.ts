"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export const useDevboxUpdate = () => {
	const { devbox } = useTRPCClients();

	const mutation = useMutation(devbox.update.mutationOptions());

	return mutation;
};
