"use client";

import { useQueries } from "@tanstack/react-query";
import { resourceParser } from "@/lib/resource/resource.parser";
import type {
	BuiltinResourceTarget,
	CustomResourceTarget,
	ResourceTarget,
} from "@/mvvm/k8s/models/k8s.model";
import type {
	K8sItem,
	K8sResource,
} from "@/mvvm/k8s/models/k8s-resource.model";
import { useTRPCClients } from "../trpc/use-trpc-clients";

/**
 * Hook to fetch resource objects for different resource types
 * @param resources - Array of K8sItem or K8sResource objects
 * @returns Combined query results with data, loading states, and errors
 */
export const useResourceObjects = (
	resources: K8sItem[] | K8sResource[] | ResourceTarget[],
) => {
	const { devbox, cluster, osb, launchpad } = useTRPCClients();

	const targets = resourceParser.toTargets(resources);

	// Create queries for each target
	const queries = useQueries({
		queries: targets.map((target) => {
			switch (target.resourceType) {
				case "devbox":
					return devbox.get.queryOptions(target as CustomResourceTarget);
				case "cluster":
					return cluster.get.queryOptions(target as CustomResourceTarget);
				case "objectstoragebucket":
					return osb.get.queryOptions(target as CustomResourceTarget);
				case "deployment":
				case "statefulset":
					return launchpad.get.queryOptions(target as BuiltinResourceTarget);
				default:
					return {
						queryKey: [],
						queryFn: async () => {},
						enabled: false,
					};
			}
		}),
		combine: (results) => {
			return {
				data: results.map((result) => result.data),
				pending: results.some((result) => result.isPending),
				error: results.find((result) => result.error)?.error,
				isLoading: results.some((result) => result.isLoading),
				isSuccess: results.every((result) => result.isSuccess),
				isError: results.some((result) => result.isError),
			};
		},
	});

	// console.log("Combined queries:", queries.data);

	return queries;
};
