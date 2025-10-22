import { initTRPC } from "@trpc/server";
import { z } from "zod";
import {
	createCluster,
	createClusterBackup,
	deleteCluster,
	deleteClusterBackup,
	disableClusterPublicAccess,
	enableClusterPublicAccess,
	getCluster,
	getClusterBackups,
	getClusterLogs,
	getClusterVersions,
	listClusters,
	pauseCluster,
	restartCluster,
	restoreClusterBackup,
	startCluster,
	updateCluster,
} from "@/lib/sealos/cluster/cluster.api";
import {
	getClusterMonitor,
	getClusterResources,
} from "@/lib/sealos/cluster/cluster-service.api";
import { createErrorFormatter } from "@/lib/trpc/trpc.utils";
import { CustomResourceTargetSchema } from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import { clusterCreateSchema } from "@/mvvm/sealos/cluster/models/cluster-create.model";
import { clusterUpdateSchema } from "@/mvvm/sealos/cluster/models/cluster-update.model";

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
			return await getCluster(ctx, input);
		}),

	list: t.procedure
		.input(z.string().optional().default("cluster"))
		.query(async ({ ctx }) => {
			return await listClusters(ctx);
		}),

	backups: t.procedure
		.input(CustomResourceTargetSchema)
		.query(async ({ input, ctx }) => {
			return await getClusterBackups(ctx, input);
		}),

	logs: t.procedure
		.input(CustomResourceTargetSchema)
		.query(async ({ input, ctx }) => {
			return await getClusterLogs(ctx, input);
		}),

	versions: t.procedure.query(async ({ ctx }) => {
		return await getClusterVersions(ctx);
	}),

	// Monitoring
	monitor: t.procedure
		.input(
			CustomResourceTargetSchema.extend({
				dbType: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			return await getClusterMonitor(ctx, input.name, input.dbType);
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
			return await getClusterResources(ctx, input.target, input.resources);
		}),

	// ===== MUTATION PROCEDURES =====

	// Cluster Lifecycle Management
	create: t.procedure
		.input(clusterCreateSchema)
		.mutation(async ({ input, ctx }) => {
			return await createCluster(ctx, input);
		}),

	start: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ input, ctx }) => {
			return await startCluster(ctx, input.name);
		}),

	pause: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ input, ctx }) => {
			return await pauseCluster(ctx, input.name);
		}),

	restart: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ input, ctx }) => {
			return await restartCluster(ctx, input.name);
		}),

	update: t.procedure
		.input(clusterUpdateSchema)
		.mutation(async ({ input, ctx }) => {
			return await updateCluster(ctx, input);
		}),

	delete: t.procedure
		.input(
			z.object({
				clusterName: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			return await deleteCluster(ctx, input.clusterName);
		}),

	deleteBackup: t.procedure
		.input(
			z.object({
				clusterName: z.string(),
				backupName: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			return await deleteClusterBackup(
				ctx,
				input.clusterName,
				input.backupName,
			);
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
			return await createClusterBackup(ctx, input.databaseName, input.remark);
		}),

	restoreBackup: t.procedure
		.input(
			z.object({
				databaseName: z.string(),
				backupName: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			return await restoreClusterBackup(
				ctx,
				input.databaseName,
				input.backupName,
			);
		}),

	// Public Access Management
	enablePublic: t.procedure
		.input(
			z.object({
				databaseName: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			return await enableClusterPublicAccess(ctx, input.databaseName);
		}),

	disablePublic: t.procedure
		.input(
			z.object({
				databaseName: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			return await disableClusterPublicAccess(ctx, input.databaseName);
		}),
});

export type ClusterRouter = typeof clusterRouter;
