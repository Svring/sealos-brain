"use client";

import { devboxParser } from "@sealos-brain/sealos/devbox/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queires";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export const useDevboxCreate = () => {
	const { devbox } = useTRPCClients();
	const { invalidateQueries } = useInvalidateQueries();

	const mutation = useMutation({
		...devbox.create.mutationOptions(),
		onSuccess: (_, variables) => {
			invalidateQueries([
				devbox.get.queryKey(devboxParser.toTarget(variables.name)),
			]);
			toast.success(`Devbox ${variables.name} created successfully`);
		},
		onError: (error) => {
			toast.error(`Failed to create devbox: ${error.message}`);
		},
	});

	return mutation;
};
