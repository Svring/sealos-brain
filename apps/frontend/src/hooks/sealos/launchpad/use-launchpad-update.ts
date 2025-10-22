"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export const useLaunchpadUpdate = () => {
	const { launchpad } = useTRPCClients();

	const mutation = useMutation(launchpad.update.mutationOptions());

	return mutation;
};
