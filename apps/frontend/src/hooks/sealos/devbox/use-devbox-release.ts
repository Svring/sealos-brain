"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/trpc/hooks/use-trpc-clients";

export const useDevboxReleases = (devboxName: string) => {
	const { devbox } = useTRPCClients();

	const query = useQuery(devbox.releases.queryOptions(devboxName));

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
};

export const useDevboxRelease = () => {
	const { devbox } = useTRPCClients();

	const releaseMutation = useMutation(devbox.release.mutationOptions());
	const deleteReleaseMutation = useMutation(devbox.deleteRelease.mutationOptions());

	const release = async (devboxName: string, tag: string, releaseDes?: string) => {
		return await releaseMutation.mutateAsync({
			devboxName,
			tag,
			releaseDes: releaseDes || "",
		});
	};

	const deleteRelease = async (releaseName: string) => {
		return await deleteReleaseMutation.mutateAsync(releaseName);
	};

	return {
		release,
		deleteRelease,
		isReleasing: releaseMutation.isPending,
		isDeleting: deleteReleaseMutation.isPending,
	};
};
