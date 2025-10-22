"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { devboxParser } from "@/lib/sealos/devbox/devbox.parser";

export const useDevboxDelete = () => {
	const { devbox } = useTRPCClients();

	const mutation = useMutation(devbox.delete.mutationOptions());

	const del = async (devboxName: string) => {
		const target = devboxParser.toTarget(devboxName);
		return await mutation.mutateAsync(target);
	};

	return {
		...mutation,
		del,
	};
};
