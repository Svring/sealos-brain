"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "../../trpc/use-trpc-clients";

export const useProxyToken = () => {
	const { aiProxy } = useTRPCClients();

	const query = useQuery(aiProxy.list.queryOptions("tokens"));

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
};
