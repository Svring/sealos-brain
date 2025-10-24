"use client";

import type { CustomResourceTarget } from "@sealos-brain/k8s/shared/models";
import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export const useClusterObject = (target: CustomResourceTarget) => {
	const { cluster } = useTRPCClients();

	const query = useQuery(cluster.get.queryOptions(target));

	// console.log("query", query.data);

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
};
