import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createLanggraphContext, langgraphRouter } from "@/trpc/langgraph.trpc";

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc/langgraph",
		req,
		router: langgraphRouter,
		createContext: () => createLanggraphContext({ req }),
	});

export { handler as GET, handler as POST };
