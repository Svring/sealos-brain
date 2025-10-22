import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createDevboxContext, devboxRouter } from "@/trpc/devbox.trpc";

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc/devbox",
		req,
		router: devboxRouter,
		createContext: () => createDevboxContext({ req }),
	});

export { handler as GET, handler as POST };
