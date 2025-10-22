import { initTRPC } from "@trpc/server";
import { getOsbBucket } from "@/lib/sealos/osb/osb.api";
import { createErrorFormatter } from "@/lib/trpc/trpc.utils";
import { CustomResourceTargetSchema } from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";

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
