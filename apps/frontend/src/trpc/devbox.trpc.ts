import { initTRPC } from "@trpc/server";
import { z } from "zod";
import {
	authCname,
	autostartDevbox,
	createDevbox,
	deleteDevbox,
	deleteDevboxRelease,
	deployDevbox,
	getDevbox,
	getDevboxReleases,
	getDevboxTemplates,
	pauseDevbox,
	releaseDevbox,
	restartDevbox,
	shutdownDevbox,
	startDevbox,
	updateDevbox,
} from "@/lib/sealos/devbox/devbox.api";
import {
	getDevboxDeployments,
	getDevboxMonitor,
	getDevboxNetwork,
	getDevboxResources,
} from "@/lib/sealos/devbox/devbox-service.api";
import { createErrorFormatter } from "@/lib/trpc/trpc.utils";
import { CustomResourceTargetSchema } from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import { devboxCreateSchema } from "@/mvvm/sealos/devbox/models/devbox-create.model";
import { devboxUpdateSchema } from "@/mvvm/sealos/devbox/models/devbox-update.model";

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
			return await getDevbox(ctx, input);
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
		return await getDevboxReleases(ctx, input);
	}),

	deployments: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
		return await getDevboxDeployments(ctx, input);
	}),

	// Templates
	templates: t.procedure.query(async ({ ctx }) => {
		return await getDevboxTemplates(ctx);
	}),

	// Domain Authentication
	authCname: t.procedure
		.input(
			z.object({
				publicDomain: z.string().min(1, "Public domain is required"),
				customDomain: z.string().min(1, "Custom domain is required"),
			}),
		)
		.query(async ({ ctx, input }) => {
			return await authCname(ctx, input.publicDomain, input.customDomain);
		}),

	// ===== MUTATION PROCEDURES =====

	// DevBox Lifecycle Management
	create: t.procedure
		.input(devboxCreateSchema)
		.mutation(async ({ ctx, input }) => {
			return await createDevbox(ctx, input);
		}),

	update: t.procedure
		.input(devboxUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			return await updateDevbox(ctx, input);
		}),

	start: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ ctx, input }) => {
			if (!input.name) throw new Error("DevBox name is required");
			return await startDevbox(ctx, input.name);
		}),

	pause: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ ctx, input }) => {
			if (!input.name) throw new Error("DevBox name is required");
			return await pauseDevbox(ctx, input.name);
		}),

	shutdown: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ ctx, input }) => {
			if (!input.name) throw new Error("DevBox name is required");
			return await shutdownDevbox(ctx, input.name);
		}),

	restart: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ ctx, input }) => {
			if (!input.name) throw new Error("DevBox name is required");
			return await restartDevbox(ctx, input.name);
		}),

	autostart: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ ctx, input }) => {
			if (!input.name) throw new Error("DevBox name is required");
			return await autostartDevbox(ctx, input.name);
		}),

	delete: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ ctx, input }) => {
			if (!input.name) throw new Error("DevBox name is required");
			return await deleteDevbox(ctx, input.name);
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
			return await releaseDevbox(ctx, devboxName, tag, releaseDes);
		}),

	deleteRelease: t.procedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			return await deleteDevboxRelease(ctx, input);
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
			return await deployDevbox(ctx, devboxName, tag);
		}),
});

export type DevboxRouter = typeof devboxRouter;
