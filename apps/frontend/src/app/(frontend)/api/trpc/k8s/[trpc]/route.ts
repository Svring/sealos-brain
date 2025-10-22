import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createK8sContext, k8sRouter } from "@/trpc/k8s.trpc";

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc/k8s",
		req,
		router: k8sRouter,
		createContext: () => createK8sContext({ req }),
	});

export { handler as GET, handler as POST };
