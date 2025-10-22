import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createInstanceContext, instanceRouter } from "@/trpc/instance.trpc";

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc/instance",
		req,
		router: instanceRouter,
		createContext: () => createInstanceContext({ req }),
	});

export { handler as GET, handler as POST };
