"use client";

import { devboxParser } from "@sealos-brain/sealos/devbox/utils";
import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export const useDevboxLifecycle = () => {
	const { devbox } = useTRPCClients();

	const startMutation = useMutation(devbox.start.mutationOptions());
	const pauseMutation = useMutation(devbox.pause.mutationOptions());
	const restartMutation = useMutation(devbox.restart.mutationOptions());
	const shutdownMutation = useMutation(devbox.shutdown.mutationOptions());
	const autostartMutation = useMutation(devbox.autostart.mutationOptions());

	const start = async (devboxName: string) => {
		const target = devboxParser.toTarget(devboxName);
		return await startMutation.mutateAsync(target);
	};

	const pause = async (devboxName: string) => {
		const target = devboxParser.toTarget(devboxName);
		return await pauseMutation.mutateAsync(target);
	};

	const restart = async (devboxName: string) => {
		const target = devboxParser.toTarget(devboxName);
		return await restartMutation.mutateAsync(target);
	};

	const shutdown = async (devboxName: string) => {
		const target = devboxParser.toTarget(devboxName);
		return await shutdownMutation.mutateAsync(target);
	};

	const autostart = async (devboxName: string) => {
		const target = devboxParser.toTarget(devboxName);
		return await autostartMutation.mutateAsync(target);
	};

	return {
		start,
		pause,
		restart,
		shutdown,
		autostart,
		isPending: {
			start: startMutation.isPending,
			pause: pauseMutation.isPending,
			restart: restartMutation.isPending,
			shutdown: shutdownMutation.isPending,
			autostart: autostartMutation.isPending,
		},
	};
};
