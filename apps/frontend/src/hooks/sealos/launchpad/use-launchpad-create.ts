"use client";

import { launchpadParser } from "@sealos-brain/sealos/launchpad/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queires";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export const useLaunchpadCreate = () => {
	const { launchpad } = useTRPCClients();
	const { invalidateQueries } = useInvalidateQueries();

	const mutation = useMutation({
		...launchpad.create.mutationOptions(),
		onSuccess: (_, variables) => {
			invalidateQueries([
				launchpad.get.queryKey(launchpadParser.toTarget(variables.name)),
			]);
			toast.success(`Launchpad ${variables.name} created successfully`);
		},
		onError: (error) => {
			toast.error(`Failed to create launchpad: ${error.message}`);
		},
	});

	return mutation;
};
