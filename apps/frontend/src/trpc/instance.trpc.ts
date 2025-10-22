import { initTRPC } from "@trpc/server";
import { z } from "zod";
import {
	addResourcesToInstance,
	createInstance,
	deleteInstance,
	getInstance,
	getInstanceResources,
	listInstances,
	removeResourcesFromInstance,
	updateInstanceName,
} from "@/lib/sealos/instance/instance.api";
import { createErrorFormatter } from "@/lib/trpc/trpc.utils";
import {
	CustomResourceTargetSchema,
	resourceTargetSchema,
} from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import { K8sItemSchema } from "@/mvvm/k8s/models/k8s-resource.model";
import { instanceCreateSchema } from "@/mvvm/sealos/instance/models/instance-create.model";
import { InstanceObjectSchema } from "@/mvvm/sealos/instance/models/instance-object.model";
import { instanceUpdateSchema } from "@/mvvm/sealos/instance/models/instance-update.model";

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
			return await getInstance(ctx, input);
		}),

	resources: t.procedure
		.input(CustomResourceTargetSchema)
		.output(z.array(K8sItemSchema))
		.query(async ({ ctx, input }) => {
			return await getInstanceResources(ctx, input);
		}),

	// ===== MUTATION PROCEDURES =====

	// Instance Lifecycle Management
	create: t.procedure
		.input(instanceCreateSchema)
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
		.input(instanceUpdateSchema)
		.output(
			z.object({
				name: z.string(),
				newDisplayName: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await updateInstanceName(ctx, input);
		}),

	// Resource Management
	addResources: t.procedure
		.input(
			z.object({
				target: CustomResourceTargetSchema,
				resources: z.array(resourceTargetSchema),
			}),
		)
		.output(z.object({ success: z.boolean() }))
		.mutation(async ({ ctx, input }) => {
			return await addResourcesToInstance(ctx, input.target, input.resources);
		}),

	removeResources: t.procedure
		.input(
			z.object({
				resources: z.array(resourceTargetSchema),
			}),
		)
		.output(z.object({ success: z.boolean() }))
		.mutation(async ({ ctx, input }) => {
			return await removeResourcesFromInstance(ctx, input.resources);
		}),
});

export type InstanceRouter = typeof instanceRouter;
