import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createLaunchpadContext, launchpadRouter } from "@/trpc/launchpad.trpc";

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc/launchpad",
		req,
		router: launchpadRouter,
		createContext: () => createLaunchpadContext({ req }),
	});

export { handler as GET, handler as POST };
