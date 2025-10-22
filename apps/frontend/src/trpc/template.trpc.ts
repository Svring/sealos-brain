import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { getTemplate, listTemplates } from "@/lib/sealos/template/template.api";
import { createErrorFormatter } from "@/lib/trpc/trpc.utils";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";

// Context creation function
export async function createTemplateContext(opts: {
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

export const templateRouter = t.router({
	// ===== QUERY PROCEDURES =====

	// Template Listing & Information
	list: t.procedure.query(async ({ ctx }) => {
		return await listTemplates(ctx);
	}),

	get: t.procedure
		.input(z.string().min(1, "Template name is required"))
		.query(async ({ input, ctx }) => {
			return await getTemplate(ctx, input);
		}),
});

export type TemplateRouter = typeof templateRouter;
