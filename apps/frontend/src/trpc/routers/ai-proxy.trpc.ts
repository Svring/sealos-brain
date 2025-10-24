import { getRegionUrlFromKubeconfig } from "@sealos-brain/lib/k8s-server.utils";
import { initTRPC } from "@trpc/server";
import { z } from "zod";
import {
	createAiProxyToken,
	deleteAiProxyToken,
	getAiProxyTokens,
} from "@/lib/sealos/ai-proxy/ai-proxy.api";
import { createErrorFormatter } from "@/lib/trpc/trpc.utils";
import { AiProxyTokenSchema } from "@/models/sealos/ai-proxy/ai-proxy-resource.model";

// ===== CONTEXT =====
export async function createAiProxyContext(opts: { req: Request }) {
	const kubeconfigEncoded = opts.req.headers.get("kubeconfigEncoded");
	const appToken = opts.req.headers.get("appToken");

	if (!kubeconfigEncoded) {
		throw new Error("kubeconfigEncoded header is required");
	}

	const kubeconfig = decodeURIComponent(kubeconfigEncoded);
	const regionUrl = await getRegionUrlFromKubeconfig(kubeconfig);

	if (!regionUrl) {
		throw new Error("Failed to extract region URL from kubeconfig");
	}

	return {
		authorization: appToken as string,
		regionUrl: regionUrl,
	};
}

export type AiProxyContext = Awaited<ReturnType<typeof createAiProxyContext>>;

// ===== SCHEMAS =====

// ===== ROUTER =====

const t = initTRPC.context<AiProxyContext>().create(createErrorFormatter());

export const aiProxyRouter = t.router({
	// ===== QUERY PROCEDURES =====

	// Token Listing
	list: t.procedure
		.input(z.string().optional().default("tokens"))
		.output(z.array(AiProxyTokenSchema))
		.query(async ({ ctx, input: _input }) => {
			const result = await getAiProxyTokens(ctx);
			return result;
		}),

	// ===== MUTATION PROCEDURES =====

	// Token Management
	create: t.procedure
		.input(z.object({ name: z.string() }))
		.mutation(async ({ input, ctx }) => {
			return await createAiProxyToken(ctx, input);
		}),

	delete: t.procedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			return await deleteAiProxyToken(ctx, input);
		}),
});

export type AiProxyRouter = typeof aiProxyRouter;
