"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { clusterParser } from "@/lib/sealos/cluster/cluster.parser";

export const useClusterLifecycle = () => {
	const { cluster } = useTRPCClients();

	const startMutation = useMutation(cluster.start.mutationOptions());
	const pauseMutation = useMutation(cluster.pause.mutationOptions());
	const restartMutation = useMutation(cluster.restart.mutationOptions());

	const start = async (clusterName: string) => {
		const target = clusterParser.toTarget(clusterName);
		await startMutation.mutateAsync(target);
	};

	const pause = async (clusterName: string) => {
		const target = clusterParser.toTarget(clusterName);
		await pauseMutation.mutateAsync(target);
	};

	const restart = async (clusterName: string) => {
		const target = clusterParser.toTarget(clusterName);
		await restartMutation.mutateAsync(target);
	};

	return {
		start,
		pause,
		restart,
		isPending: {
			start: startMutation.isPending,
			pause: pauseMutation.isPending,
			restart: restartMutation.isPending,
		},
	};
};
