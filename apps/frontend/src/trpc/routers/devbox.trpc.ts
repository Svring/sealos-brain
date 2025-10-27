import type { K8sContext } from "@sealos-brain/k8s/shared/models";
import { CustomResourceTargetSchema } from "@sealos-brain/k8s/shared/models";
import {
	autostartDevbox,
	createDevbox,
	deleteDevbox,
	deleteDevboxRelease,
	deployDevbox,
	getDevbox,
	getDevboxDeployments,
	getDevboxMonitor,
	getDevboxNetwork,
	getDevboxReleases,
	getDevboxResources,
	getDevboxTemplates,
	pauseDevbox,
	releaseDevbox,
	restartDevbox,
	shutdownDevbox,
	startDevbox,
	updateDevbox,
} from "@sealos-brain/sealos/devbox/api";
import {
	devboxCreateSchema,
	devboxUpdateSchema,
} from "@sealos-brain/sealos/devbox/models";
import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { createErrorFormatter } from "@/trpc/utils/trpc.utils";

// Context creation function
export async function createDevboxContext(opts: {
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

export const devboxRouter = t.router({
	// ===== QUERY PROCEDURES =====

	// DevBox Listing & Information
	list: t.procedure
		.input(z.string().optional().default("devbox"))
		.query(async ({ ctx: _ctx, input: _input }) => {
			// TODO: Implement list devboxes
			throw new Error("Not implemented");
		}),

	get: t.procedure
		.input(CustomResourceTargetSchema)
		.query(async ({ input, ctx }) => {
			return await getDevbox(ctx, { path: { name: input.name } });
		}),

	monitor: t.procedure
		.input(CustomResourceTargetSchema)
		.query(async ({ input, ctx }) => {
			return await getDevboxMonitor(ctx, input);
		}),

	resources: t.procedure
		.input(
			z.object({
				target: CustomResourceTargetSchema,
				resources: z
					.array(z.string())
					.optional()
					.default([
						"ingress",
						"service",
						"secret",
						"pod",
						"issuers",
						"certificates",
					]),
			}),
		)
		.query(async ({ input, ctx }) => {
			return await getDevboxResources(ctx, input.target, input.resources);
		}),

	network: t.procedure
		.input(CustomResourceTargetSchema)
		.query(async ({ input, ctx }) => {
			return await getDevboxNetwork(ctx, input);
		}),

	// Release Information
	releases: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
		return await getDevboxReleases(ctx, { path: { name: input } });
	}),

	deployments: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
		return await getDevboxDeployments(ctx, input);
	}),

	// Templates
	templates: t.procedure.query(async ({ ctx }) => {
		return await getDevboxTemplates(ctx);
	}),

	// ===== MUTATION PROCEDURES =====

	// DevBox Lifecycle Management
	create: t.procedure
		.input(devboxCreateSchema)
		.mutation(async ({ ctx, input }) => {
			return await createDevbox(ctx, { body: input });
		}),

	update: t.procedure
		.input(devboxUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			const { name, ...body } = input;
			return await updateDevbox(ctx, { path: { name }, body });
		}),

	start: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ ctx, input }) => {
			if (!input.name) throw new Error("DevBox name is required");
			return await startDevbox(ctx, { path: { name: input.name } });
		}),

	pause: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ ctx, input }) => {
			if (!input.name) throw new Error("DevBox name is required");
			return await pauseDevbox(ctx, { path: { name: input.name } });
		}),

	shutdown: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ ctx, input }) => {
			if (!input.name) throw new Error("DevBox name is required");
			return await shutdownDevbox(ctx, { path: { name: input.name } });
		}),

	restart: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ ctx, input }) => {
			if (!input.name) throw new Error("DevBox name is required");
			return await restartDevbox(ctx, { path: { name: input.name } });
		}),

	autostart: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ ctx, input }) => {
			if (!input.name) throw new Error("DevBox name is required");
			return await autostartDevbox(ctx, { path: { name: input.name } });
		}),

	delete: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ ctx, input }) => {
			if (!input.name) throw new Error("DevBox name is required");
			return await deleteDevbox(ctx, { path: { name: input.name } });
		}),

	// Release Management
	release: t.procedure
		.input(
			z.object({
				devboxName: z.string().min(1, "DevBox name is required"),
				tag: z.string().min(1, "Release tag is required"),
				releaseDes: z.string().default(""),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { devboxName, tag, releaseDes } = input;
			return await releaseDevbox(ctx, {
				path: { name: devboxName },
				body: { tag, releaseDes },
			});
		}),

	deleteRelease: t.procedure
		.input(
			z.object({
				name: z.string().min(1, "DevBox name is required"),
				tag: z.string().min(1, "Release tag is required"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await deleteDevboxRelease(ctx, {
				path: { name: input.name, tag: input.tag },
			});
		}),

	deploy: t.procedure
		.input(
			z.object({
				devboxName: z.string().min(1, "DevBox name is required"),
				tag: z.string().min(1, "Devbox release version tag is required"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { devboxName, tag } = input;
			return await deployDevbox(ctx, { path: { name: devboxName, tag } });
		}),
});

export type DevboxRouter = typeof devboxRouter;
