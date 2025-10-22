"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s.model";

interface ClusterMonitorParams extends CustomResourceTarget {
	dbType: string;
}

export const useClusterMonitor = (params: ClusterMonitorParams) => {
	const { cluster } = useTRPCClients();

	const query = useQuery(cluster.monitor.queryOptions(params));

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
};
