import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { clusterRouter, createClusterContext } from "@/trpc/cluster.trpc";

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc/cluster",
		req,
		router: clusterRouter,
		createContext: () => createClusterContext({ req }),
	});

export { handler as GET, handler as POST };
