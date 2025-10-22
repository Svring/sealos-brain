"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "../../trpc/use-trpc-clients";

export const useInstances = () => {
	const { instance } = useTRPCClients();

	const query = useQuery(instance.list.queryOptions("instances"));

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
	};
};
