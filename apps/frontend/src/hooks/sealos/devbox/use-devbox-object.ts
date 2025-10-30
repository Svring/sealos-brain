"use client";

import type { CustomResourceTarget } from "@sealos-brain/k8s/shared/models";
import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export const useDevboxObject = (target: CustomResourceTarget) => {
	const { devbox } = useTRPCClients();

	const query = useQuery(devbox.get.queryOptions(target));

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
};
