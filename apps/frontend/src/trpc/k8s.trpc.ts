import { k8sParser } from "@sealos-brain/lib/k8s-parser";
import {
	deleteResource,
	getResource,
	listResources,
	patchResource,
	patchResourceMetadata,
	removeResourceMetadata,
	selectResources,
	strategicMergePatchResource,
	upsertResource,
} from "@sealos-brain/lib/k8s-service";
import { initTRPC } from "@trpc/server";
import type { Operation } from "fast-json-patch";
import { z } from "zod";
import { getResourceEvents } from "@/lib/sealos/event/event.api";
import { getResourceLogs } from "@/lib/sealos/log/log.api";
import { getResourcePods } from "@/lib/sealos/pod/pod.api";
import { quotaParser } from "@/lib/sealos/quota/quota.parser";
import { createErrorFormatter } from "@/lib/trpc/trpc.utils";
import {
	resourceTargetSchema,
	resourceTypeTargetSchema,
} from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import { QuotaResourceSchema } from "@/mvvm/sealos/quota/models/quota-resource.model";

// Context creation function
export async function createK8sContext(opts: {
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

export const k8sRouter = t.router({
	// ===== QUERY PROCEDURES =====

	// Resource Information
	list: t.procedure
		.input(resourceTypeTargetSchema)
		.query(async ({ ctx, input }) => {
			return await listResources(ctx, input);
		}),

	get: t.procedure.input(resourceTargetSchema).query(async ({ ctx, input }) => {
		return await getResource(ctx, input);
	}),

	select: t.procedure
		.input(z.array(resourceTypeTargetSchema))
		.output(z.array(z.any())) // K8sResource array
		.query(async ({ ctx, input }) => {
			return await selectResources(ctx, input);
		}),

	// Quota Management
	quota: t.procedure.query(async ({ ctx }) => {
		// List resource quotas using the builtin resource type
		const quotaTarget = k8sParser.fromTypeToTarget("resourcequota");

		const quotaList = await listResources(ctx, quotaTarget);

		// Return the first resource quota if available
		if (quotaList.items && quotaList.items.length > 0) {
			const quotaResource = quotaList.items[0];

			// Validate and parse the quota using our schema
			const validatedQuota = QuotaResourceSchema.parse(quotaResource);

			// Convert to quota object for easier consumption
			return quotaParser.toObject(validatedQuota);
		}

		throw new Error("No resource quotas found");
	}),

	// Pod Management
	pods: t.procedure
		.input(resourceTargetSchema)
		.query(async ({ ctx, input }) => {
			return await getResourcePods(ctx, input);
		}),

	// Events Management
	events: t.procedure
		.input(resourceTargetSchema)
		.query(async ({ ctx, input }) => {
			return await getResourceEvents(ctx, input);
		}),

	// Logs Management
	logs: t.procedure
		.input(resourceTargetSchema)
		.query(async ({ ctx, input }) => {
			return await getResourceLogs(ctx, input);
		}),

	// ===== MUTATION PROCEDURES =====

	// Resource Lifecycle Management
	delete: t.procedure
		.input(z.union([resourceTargetSchema, z.array(resourceTargetSchema)]))
		.mutation(async ({ ctx, input }) => {
			const targets = Array.isArray(input) ? input : [input];
			const results = await Promise.all(
				targets.map((target) => deleteResource(ctx, target)),
			);
			return results;
		}),

	upsert: t.procedure
		.input(
			z.object({
				target: resourceTargetSchema,
				resourceBody: z.record(z.unknown()),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { target, resourceBody } = input;
			return await upsertResource(ctx, target, resourceBody);
		}),

	// Resource Patching
	patch: t.procedure
		.input(
			z.object({
				target: resourceTargetSchema,
				patchBody: z.array(z.record(z.unknown())), // Operation[]
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { target, patchBody } = input;
			return await patchResource(
				ctx,
				target,
				patchBody as unknown as Operation[],
			);
		}),

	// Strategic Merge Patch
	merge: t.procedure
		.input(
			z.object({
				target: resourceTargetSchema,
				patchBody: z.record(z.unknown()),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { target, patchBody } = input;
			return await strategicMergePatchResource(ctx, target, patchBody);
		}),

	// Metadata Management
	patchMeta: t.procedure
		.input(
			z.object({
				target: z.union([resourceTargetSchema, z.array(resourceTargetSchema)]),
				metadataType: z.enum(["annotations", "labels"]),
				key: z.string(),
				value: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { target, metadataType, key, value } = input;
			const targets = Array.isArray(target) ? target : [target];
			const results = await Promise.all(
				targets.map((t) =>
					patchResourceMetadata(ctx, t, metadataType, key, value),
				),
			);
			return results;
		}),

	removeMeta: t.procedure
		.input(
			z.object({
				target: z.union([resourceTargetSchema, z.array(resourceTargetSchema)]),
				metadataType: z.enum(["annotations", "labels"]),
				key: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { target, metadataType, key } = input;
			const targets = Array.isArray(target) ? target : [target];
			const results = await Promise.all(
				targets.map((t) => removeResourceMetadata(ctx, t, metadataType, key)),
			);
			return results;
		}),
});

export type K8sRouter = typeof k8sRouter;
