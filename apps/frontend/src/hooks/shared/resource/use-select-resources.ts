"use client";

import type { ResourceTypeTarget } from "@sealos-brain/k8s/shared/models";
import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "../../trpc/use-trpc-clients";

export const useSelectResources = (targets: ResourceTypeTarget[]) => {
	const { k8s } = useTRPCClients();

	const query = useQuery(k8s.select.queryOptions(targets));

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
	};
};
