import type { K8sContext } from "@sealos-brain/k8s/shared/models";
import {
	CustomResourceTargetSchema,
	K8sItemSchema,
	ResourceTargetSchema,
} from "@sealos-brain/k8s/shared/models";
import {
	addResourcesToInstance,
	createInstance,
	deleteInstance,
	getInstance,
	getInstanceResources,
	listInstances,
	removeResourcesFromInstance,
	updateInstanceName,
} from "@sealos-brain/sealos/instance/api";
import {
	InstanceCreateSchema,
	InstanceObjectSchema,
	InstanceUpdateSchema,
} from "@sealos-brain/sealos/instance/models";
import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { createErrorFormatter } from "@/trpc/utils/trpc.utils";

// Context creation function
export async function createInstanceContext(opts: {
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

export const instanceRouter = t.router({
	// ===== QUERY PROCEDURES =====

	// Instance Information
	list: t.procedure
		.input(z.string().optional().default("instances"))
		.output(z.array(InstanceObjectSchema))
		.query(async ({ ctx }) => {
			return await listInstances(ctx);
		}),

	get: t.procedure
		.input(CustomResourceTargetSchema)
		.output(InstanceObjectSchema)
		.query(async ({ ctx, input }) => {
			return await getInstance(ctx, input.name);
		}),

	resources: t.procedure
		.input(CustomResourceTargetSchema)
		.output(z.array(K8sItemSchema))
		.query(async ({ ctx, input }) => {
			return await getInstanceResources(ctx, input.name);
		}),

	// ===== MUTATION PROCEDURES =====

	// Instance Lifecycle Management
	create: t.procedure
		.input(InstanceCreateSchema)
		.output(InstanceObjectSchema)
		.mutation(async ({ ctx, input }) => {
			return await createInstance(ctx, input);
		}),

	delete: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ ctx, input }) => {
			return await deleteInstance(ctx, input.name);
		}),

	// Instance Configuration
	update: t.procedure
		.input(InstanceUpdateSchema)
		.output(InstanceUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await updateInstanceName(ctx, {
				name: input.name,
				displayName: input.displayName,
			});
			return { name: result.name, displayName: result.newDisplayName };
		}),

	// Resource Management
	addResources: t.procedure
		.input(
			z.object({
				target: CustomResourceTargetSchema,
				resources: z.array(ResourceTargetSchema),
			}),
		)
		.output(z.object({ success: z.boolean() }))
		.mutation(async ({ ctx, input }) => {
			return await addResourcesToInstance(
				ctx,
				input.target.name,
				input.resources,
			);
		}),

	removeResources: t.procedure
		.input(
			z.object({
				resources: z.array(ResourceTargetSchema),
			}),
		)
		.output(z.object({ success: z.boolean() }))
		.mutation(async ({ ctx, input }) => {
			return await removeResourcesFromInstance(ctx, input.resources);
		}),
});

export type InstanceRouter = typeof instanceRouter;
