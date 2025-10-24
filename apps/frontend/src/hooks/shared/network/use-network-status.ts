"use client";

import type {
	BuiltinResourceTarget,
	CustomResourceTarget,
	ResourceTarget,
} from "@sealos-brain/k8s/shared/models";
import { useQueries } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export const useNetworkStatus = (target: ResourceTarget) => {
	const { launchpad, devbox } = useTRPCClients();

	// Create queries for the single target
	const queries = useQueries({
		queries: [
			(() => {
				switch (target.resourceType) {
					case "devbox":
						return devbox.network.queryOptions(target as CustomResourceTarget);
					case "deployment":
					case "statefulset":
						return launchpad.network.queryOptions(
							target as BuiltinResourceTarget,
						);
					default:
						return {
							queryKey: [],
							queryFn: async () => {
								throw new Error(
									`Unsupported resource type: ${target.resourceType}`,
								);
							},
							enabled: false,
						};
				}
			})(),
		],
		combine: (results) => {
			return {
				data: results[0]?.data,
				pending: results[0]?.isPending,
				error: results[0]?.error,
				isLoading: results[0]?.isLoading,
				isSuccess: results[0]?.isSuccess,
				isError: results[0]?.isError,
			};
		},
	});

	return queries;
};
