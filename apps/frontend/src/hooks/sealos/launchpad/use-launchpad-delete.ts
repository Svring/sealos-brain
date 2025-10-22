"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { launchpadParser } from "@/lib/sealos/launchpad/launchpad.parser";

export const useLaunchpadDelete = () => {
	const { launchpad } = useTRPCClients();

	const mutation = useMutation(launchpad.delete.mutationOptions());

	const deleteLaunchpad = async (launchpadName: string) => {
		const target = launchpadParser.toTarget(launchpadName);
		return await mutation.mutateAsync(target);
	};

	return {
		...mutation,
		deleteLaunchpad,
	};
};
