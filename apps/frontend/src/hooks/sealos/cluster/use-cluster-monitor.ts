"use client";

import type { CustomResourceTarget } from "@sealos-brain/k8s/shared/models";
import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

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
