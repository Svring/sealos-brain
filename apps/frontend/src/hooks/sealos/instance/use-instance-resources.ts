"use client";

import type { CustomResourceTarget } from "@sealos-brain/k8s/shared/models";
import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export const useInstanceResources = (target: CustomResourceTarget) => {
	const { instance } = useTRPCClients();

	const query = useQuery(instance.resources.queryOptions(target));

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
};
