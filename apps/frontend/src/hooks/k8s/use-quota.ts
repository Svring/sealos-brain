"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "../trpc/use-trpc-clients";

export const useQuota = () => {
	const { k8s } = useTRPCClients();

	const query = useQuery(k8s.quota.queryOptions());

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
	};
};
