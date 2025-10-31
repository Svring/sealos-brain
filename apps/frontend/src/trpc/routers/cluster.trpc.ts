import type { K8sContext } from "@sealos-brain/k8s/shared/models";
import { CustomResourceTargetSchema } from "@sealos-brain/k8s/shared/models";
import {
	createCluster,
	createClusterBackup,
	deleteCluster,
	deleteClusterBackup,
	disableClusterPublicAccess,
	enableClusterPublicAccess,
	getCluster,
	getClusterResources,
	getClusterVersions,
	listClusters,
	pauseCluster,
	restartCluster,
	restoreClusterBackup,
	startCluster,
	updateCluster,
} from "@sealos-brain/sealos/cluster/api";
import {
	clusterCreateSchema,
	clusterUpdateSchema,
} from "@sealos-brain/sealos/cluster/models";
import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { createErrorFormatter } from "@/trpc/utils/trpc.utils";

// Context creation function
export async function createClusterContext(opts: {
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

export const clusterRouter = t.router({
	// ===== QUERY PROCEDURES =====

	// Cluster Information
	get: t.procedure
		.input(CustomResourceTargetSchema)
		.query(async ({ input, ctx }) => {
			return await getCluster(ctx, {
				path: { databaseName: input.name },
			});
		}),

	list: t.procedure
		.input(z.string().optional().default("cluster"))
		.query(async ({ ctx }) => {
			return await listClusters(ctx);
		}),

	versions: t.procedure.query(async ({ ctx }) => {
		return await getClusterVersions(ctx);
	}),

	resources: t.procedure
		.input(
			z.object({
				target: CustomResourceTargetSchema,
				resources: z
					.array(z.string())
					.optional()
					.default([
						"serviceaccount",
						"role",
						"rolebinding",
						"secret",
						"pod",
						"cronjob",
						"backup",
					]),
			}),
		)
		.query(async ({ input, ctx }) => {
			return await getClusterResources(
				ctx,
				input.target,
				input.resources,
			);
		}),

	// ===== MUTATION PROCEDURES =====

	// Cluster Lifecycle Management
	create: t.procedure
		.input(clusterCreateSchema)
		.mutation(async ({ input, ctx }) => {
			return await createCluster(ctx, { body: input });
		}),

	start: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ input, ctx }) => {
			return await startCluster(ctx, {
				path: { databaseName: input.name },
			});
		}),

	pause: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ input, ctx }) => {
			return await pauseCluster(ctx, {
				path: { databaseName: input.name },
			});
		}),

	restart: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ input, ctx }) => {
			return await restartCluster(ctx, {
				path: { databaseName: input.name },
			});
		}),

	update: t.procedure
		.input(clusterUpdateSchema)
		.mutation(async ({ input, ctx }) => {
			const { name, ...body } = input;
			return await updateCluster(ctx, {
				path: { databaseName: name },
				body,
			});
		}),

	delete: t.procedure
		.input(
			z.object({
				clusterName: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			return await deleteCluster(ctx, {
				path: { databaseName: input.clusterName },
			});
		}),

	deleteBackup: t.procedure
		.input(
			z.object({
				clusterName: z.string(),
				backupName: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			return await deleteClusterBackup(ctx, {
				path: { databaseName: input.clusterName, backupName: input.backupName },
			});
		}),

	// Backup Management
	createBackup: t.procedure
		.input(
			z.object({
				databaseName: z.string(),
				remark: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			return await createClusterBackup(ctx, {
				path: { databaseName: input.databaseName },
				body: { remark: input.remark },
			});
		}),

	restoreBackup: t.procedure
		.input(
			z.object({
				databaseName: z.string(),
				backupName: z.string(),
				newDbName: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			return await restoreClusterBackup(ctx, {
				path: {
					databaseName: input.databaseName,
					backupName: input.backupName,
				},
				body: { newDbName: input.newDbName },
			});
		}),

	// Public Access Management
	enablePublic: t.procedure
		.input(
			z.object({
				databaseName: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			return await enableClusterPublicAccess(ctx, {
				path: { databaseName: input.databaseName },
			});
		}),

	disablePublic: t.procedure
		.input(
			z.object({
				databaseName: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			return await disableClusterPublicAccess(ctx, {
				path: { databaseName: input.databaseName },
			});
		}),
});

export type ClusterRouter = typeof clusterRouter;
