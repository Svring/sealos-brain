"use client";

import { launchpadParser } from "@sealos-brain/sealos/launchpad/utils";
import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/trpc/hooks/use-trpc-clients";

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
