"use client";

import type { Metadata } from "@langchain/langgraph-sdk";
import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "../trpc/use-trpc-clients";

export const useSearchThreads = (metadata: Metadata) => {
	const { langgraph } = useTRPCClients();

	const query = useQuery(
		langgraph.searchThreads.queryOptions({
			metadata: metadata as Record<string, string>,
		}),
	);

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		isSuccess: query.isSuccess,
	};
};
