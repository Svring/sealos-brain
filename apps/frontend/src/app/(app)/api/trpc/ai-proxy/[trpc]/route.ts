import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import {
	aiProxyRouter,
	createAiProxyContext,
} from "@/trpc/routers/ai-proxy.trpc";

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc/ai-proxy",
		req,
		router: aiProxyRouter,
		createContext: createAiProxyContext,
	});

export { handler as GET, handler as POST };
