"use client";

import type { ResourceTarget } from "@sealos-brain/models/k8s";
import { useQueries } from "@tanstack/react-query";
import { useTRPCClients } from "../../trpc/use-trpc-clients";

/**
 * Hook to fetch a single resource object
 * @param resource - Single K8sItem, K8sResource, or ResourceTarget object
 * @returns Query result with data, loading states, and errors for the single resource
 */
export const useResourceObject = (target: ResourceTarget) => {
	const { devbox, cluster, osb, launchpad } = useTRPCClients();

	// Create queries for the single target
	const queries = useQueries({
		queries: [
			(() => {
				switch (target.resourceType) {
					case "devbox":
						return devbox.get.queryOptions(target);
					case "cluster":
						return cluster.get.queryOptions(target);
					case "objectstoragebucket":
						return osb.get.queryOptions(target);
					case "deployment":
					case "statefulset":
						return launchpad.get.queryOptions(target);
					default:
						return {
							queryKey: [],
							queryFn: async () => {},
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
