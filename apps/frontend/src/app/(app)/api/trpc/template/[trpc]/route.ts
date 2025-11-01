import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import {
	createTemplateContext,
	templateRouter,
} from "@/trpc/routers/template.trpc";

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc/template",
		req,
		router: templateRouter,
		createContext: () => createTemplateContext({ req }),
	});

export { handler as GET, handler as POST };
