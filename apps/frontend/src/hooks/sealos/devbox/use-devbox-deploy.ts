"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/trpc/hooks/use-trpc-clients";

export const useDevboxDeployments = (devboxName: string) => {
	const { devbox } = useTRPCClients();

	const query = useQuery(devbox.deployments.queryOptions(devboxName));

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
};

export const useDevboxDeploy = () => {
	const { devbox } = useTRPCClients();

	const deployMutation = useMutation(devbox.deploy.mutationOptions());

	const deploy = async (devboxName: string, tag: string) => {
		return await deployMutation.mutateAsync({
			devboxName,
			tag,
		});
	};

	return {
		deploy,
		isDeploying: deployMutation.isPending,
	};
};
