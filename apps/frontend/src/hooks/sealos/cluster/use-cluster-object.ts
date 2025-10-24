"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/trpc/hooks/use-trpc-clients";
import type { CustomResourceTarget } from "@sealos-brain/k8s/shared/models/models/k8s.model";

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
