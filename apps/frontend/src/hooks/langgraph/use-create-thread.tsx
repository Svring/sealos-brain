"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "../trpc/use-trpc-clients";

export const useCreateThread = () => {
	const { langgraph } = useTRPCClients();

	const mutation = useMutation(langgraph.createThread.mutationOptions());

	return {
		mutate: mutation.mutate,
		isLoading: mutation.isPending,
		isError: mutation.isError,
		isSuccess: mutation.isSuccess,
	};
};
