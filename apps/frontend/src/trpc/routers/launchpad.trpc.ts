import type { K8sContext } from "@sealos-brain/k8s/shared/models";
import { BuiltinResourceTargetSchema } from "@sealos-brain/k8s/shared/models";
import {
	createLaunchpad,
	deleteLaunchpad,
	getLaunchpad,
	getLaunchpadNetwork,
	getLaunchpadResources,
	pauseLaunchpad,
	restartLaunchpad,
	startLaunchpad,
	updateLaunchpad,
} from "@sealos-brain/sealos/launchpad/api";
import {
	launchpadCreateSchema,
	launchpadUpdateSchema,
} from "@sealos-brain/sealos/launchpad/models";
import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { createErrorFormatter } from "@/trpc/utils/trpc.utils";

// Context creation function
export async function createLaunchpadContext(opts: {
	req: Request;
}): Promise<K8sContext> {
	const kubeconfigEncoded = opts.req.headers.get("kubeconfigEncoded");
	if (!kubeconfigEncoded) {
		throw new Error("kubeconfigEncoded header is required");
	}

	const kubeconfig = decodeURIComponent(kubeconfigEncoded);

	return {
		kubeconfig,
	};
}

const t = initTRPC.context<K8sContext>().create(createErrorFormatter());

export const launchpadRouter = t.router({
	// ===== QUERY PROCEDURES =====

	// Launchpad Information
	get: t.procedure
		.input(BuiltinResourceTargetSchema)
		.query(async ({ ctx, input }) => {
			return await getLaunchpad(ctx, { path: { name: input.name } });
		}),

	network: t.procedure
		.input(BuiltinResourceTargetSchema)
		.query(async ({ input, ctx }) => {
			return await getLaunchpadNetwork(ctx, input);
		}),

	resources: t.procedure
		.input(
			z.object({
				target: BuiltinResourceTargetSchema,
				resources: z
					.array(z.string())
					.optional()
					.default([
						"ingress",
						"service",
						"pvc",
						"configmap",
						"pod",
						"issuer",
						"certificate",
					]),
			}),
		)
		.query(async ({ input, ctx }) => {
			return await getLaunchpadResources(ctx, input.target, input.resources);
		}),

	pods: t.procedure
		.input(z.string())
		.query(async ({ input: _input, ctx: _ctx }) => {
			// return await getLaunchpadApplicationPods(ctx, input);
		}),

	// ===== MUTATION PROCEDURES =====

	// Launchpad Lifecycle Management
	create: t.procedure
		.input(launchpadCreateSchema)
		.mutation(async ({ input, ctx }) => {
			return await createLaunchpad(ctx, { body: input });
		}),

	update: t.procedure
		.input(launchpadUpdateSchema)
		.mutation(async ({ input, ctx }) => {
			const { name, ...body } = input;
			return await updateLaunchpad(ctx, { path: { name }, body });
		}),

	start: t.procedure
		.input(BuiltinResourceTargetSchema)
		.mutation(async ({ input, ctx }) => {
			return await startLaunchpad(ctx, { path: { name: input.name } });
		}),

	pause: t.procedure
		.input(BuiltinResourceTargetSchema)
		.mutation(async ({ input, ctx }) => {
			return await pauseLaunchpad(ctx, { path: { name: input.name } });
		}),

	restart: t.procedure
		.input(BuiltinResourceTargetSchema)
		.mutation(async ({ input, ctx }) => {
			return await restartLaunchpad(ctx, { path: { name: input.name } });
		}),

	delete: t.procedure
		.input(BuiltinResourceTargetSchema)
		.mutation(async ({ input, ctx }) => {
			return await deleteLaunchpad(ctx, { path: { name: input.name } });
		}),
});

export type LaunchpadRouter = typeof launchpadRouter;
