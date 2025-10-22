"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s.model";

export const useOsbObject = (target: CustomResourceTarget) => {
	const { osb } = useTRPCClients();

	const query = useQuery(osb.get.queryOptions(target));

	// console.log("query", query.data);

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
};
