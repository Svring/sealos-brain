import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createOsbContext, osbRouter } from "@/trpc/routers/osb.trpc";

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc/osb",
		req,
		router: osbRouter,
		createContext: () => createOsbContext({ req }),
	});

export { handler as GET, handler as POST };
