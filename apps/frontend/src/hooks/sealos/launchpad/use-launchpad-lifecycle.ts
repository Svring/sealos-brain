"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { launchpadParser } from "@/lib/sealos/launchpad/launchpad.parser";

export const useLaunchpadLifecycle = () => {
	const { launchpad } = useTRPCClients();

	const startMutation = useMutation(launchpad.start.mutationOptions());
	const pauseMutation = useMutation(launchpad.pause.mutationOptions());
	const restartMutation = useMutation(launchpad.restart.mutationOptions());

	const start = async (launchpadName: string) => {
		const target = launchpadParser.toTarget(launchpadName);
		await startMutation.mutateAsync(target);
	};

	const pause = async (launchpadName: string) => {
		const target = launchpadParser.toTarget(launchpadName);
		await pauseMutation.mutateAsync(target);
	};

	const restart = async (launchpadName: string) => {
		const target = launchpadParser.toTarget(launchpadName);
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
