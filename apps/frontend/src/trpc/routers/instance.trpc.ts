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
			const result = await listInstances(ctx);
			if (result.isErr()) {
				throw result.error;
			}
			return result.value;
		}),

	get: t.procedure
		.input(CustomResourceTargetSchema)
		.output(InstanceObjectSchema)
		.query(async ({ ctx, input }) => {
			const result = await getInstance(ctx, input.name);
			if (result.isErr()) {
				throw result.error;
			}
			return result.value;
		}),

	resources: t.procedure
		.input(CustomResourceTargetSchema)
		.output(z.array(K8sItemSchema))
		.query(async ({ ctx, input }) => {
			const result = await getInstanceResources(ctx, input.name);
			if (result.isErr()) {
				throw result.error;
			}
			return result.value;
		}),

	// ===== MUTATION PROCEDURES =====

	// Instance Lifecycle Management
	create: t.procedure
		.input(InstanceCreateSchema)
		.output(InstanceObjectSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await createInstance(ctx, input);
			if (result.isErr()) {
				throw result.error;
			}
			return result.value;
		}),

	delete: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await deleteInstance(ctx, { path: { name: input.name } });
			if (result.isErr()) {
				throw result.error;
			}
			return result.value;
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
			if (result.isErr()) {
				throw result.error;
			}
			const value = result.value;
			return { name: value.name, displayName: value.newDisplayName };
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
			const result = await addResourcesToInstance(
				ctx,
				input.target.name,
				input.resources,
			);
			if (result.isErr()) {
				throw result.error;
			}
			return result.value;
		}),

	removeResources: t.procedure
		.input(
			z.object({
				resources: z.array(ResourceTargetSchema),
			}),
		)
		.output(z.object({ success: z.boolean() }))
		.mutation(async ({ ctx, input }) => {
			const result = await removeResourcesFromInstance(ctx, input.resources);
			if (result.isErr()) {
				throw result.error;
			}
			return result.value;
		}),
});

export type InstanceRouter = typeof instanceRouter;
