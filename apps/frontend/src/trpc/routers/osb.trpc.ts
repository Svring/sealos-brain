import type { K8sContext } from "@sealos-brain/k8s/shared/models";
import { CustomResourceTargetSchema } from "@sealos-brain/k8s/shared/models";
import { getOsbBucket } from "@sealos-brain/sealos/osb/api";
import { initTRPC } from "@trpc/server";
import { createErrorFormatter } from "@/lib/trpc/trpc.utils";

// Context creation function
export async function createOsbContext(opts: {
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

export const osbRouter = t.router({
	// ===== QUERY PROCEDURES =====

	// OSB Bucket Information
	get: t.procedure
		.input(CustomResourceTargetSchema)
		.query(async ({ ctx, input }) => {
			return await getOsbBucket(ctx, input);
		}),
});

export type OsbRouter = typeof osbRouter;
