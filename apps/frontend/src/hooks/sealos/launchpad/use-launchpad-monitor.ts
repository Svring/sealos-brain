"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/trpc/hooks/use-trpc-clients";
import type { BuiltinResourceTarget } from "@sealos-brain/k8s/shared/models/models/k8s.model";

interface LaunchpadMonitorParams extends BuiltinResourceTarget {
	step?: string;
}

export const useLaunchpadMonitor = (params: LaunchpadMonitorParams) => {
	const { launchpad } = useTRPCClients();

	const query = useQuery(launchpad.monitor.queryOptions(params));

	console.log("launchpad monitor query", query.data);

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
};
