"use client";

import type { BuiltinResourceTarget } from "@sealos-brain/k8s/shared/models";
import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

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
