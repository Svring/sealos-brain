"use client";

import type { BuiltinResourceTarget } from "@sealos-brain/k8s/shared/models";
import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export const useLaunchpadObject = (target: BuiltinResourceTarget) => {
	const { launchpad } = useTRPCClients();

	const query = useQuery(launchpad.get.queryOptions(target));

	// console.log("query", query.data);

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
};
