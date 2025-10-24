"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/trpc/hooks/use-trpc-clients";
import type { CustomResourceTarget } from "@sealos-brain/k8s/shared/models/models/k8s.model";

export const useDevboxMonitor = (target: CustomResourceTarget) => {
	const { devbox } = useTRPCClients();

	const query = useQuery(devbox.monitor.queryOptions(target));

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
};
