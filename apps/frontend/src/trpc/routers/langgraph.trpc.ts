import {
	createThread,
	deleteThread,
	getThread,
	patchThread,
	searchThreads,
	updateThreadState,
} from "@sealos-brain/langgraph/api";
import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { createErrorFormatter } from "@/trpc/utils/trpc.utils";

// Helper function to get environment variables
const getLanggraphConfig = () => {
	const apiUrl = process.env.LANGGRAPH_DEPLOYMENT_URL;
	const graphId = process.env.LANGGRAPH_GRAPH_ID;

	if (!apiUrl) {
		throw new Error("LANGGRAPH_DEPLOYMENT_URL environment variable is not set");
	}
	if (!graphId) {
		throw new Error("LANGGRAPH_GRAPH_ID environment variable is not set");
	}

	return { apiUrl, graphId };
};

// Context creation function
export async function createLanggraphContext(_opts: { req: Request }) {
	// TODO: Implement context creation
	return {};
}

export type LanggraphContext = Awaited<
	ReturnType<typeof createLanggraphContext>
>;

const t = initTRPC.context<LanggraphContext>().create(createErrorFormatter());

export const langgraphRouter = t.router({
	// ===== QUERY PROCEDURES =====

	getThread: t.procedure.input(z.string()).query(async ({ input }) => {
		const { apiUrl } = getLanggraphConfig();
		return await getThread(apiUrl, input);
	}),

	searchThreads: t.procedure
		.input(
			z.object({
				metadata: z.record(z.string(), z.string()),
			}),
		)
		.query(async ({ input }) => {
			const { apiUrl } = getLanggraphConfig();
			return await searchThreads(apiUrl, input.metadata);
		}),

	// ===== MUTATION PROCEDURES =====

	// Thread Lifecycle Management
	createThread: t.procedure
		.input(
			z.object({
				metadata: z
					.record(z.string(), z.string())
					.refine(
						(data) => "graphId" in data && typeof data.graphId === "string",
						{
							message: "graphId is required in metadata",
						},
					),
			}),
		)
		.mutation(async ({ input }) => {
			const { apiUrl } = getLanggraphConfig();
			const { metadata } = input;

			// Default supersteps
			const supersteps = [
				{
					updates: [
						{
							values: {},
							asNode: "__input__",
						},
					],
				},
			];

			return await createThread({
				apiUrl,
				graphId: metadata.graphId as string,
				metadata: metadata,
				supersteps,
			});
		}),

	// Update thread state
	updateThreadState: t.procedure
		.input(
			z.object({
				threadId: z.string(),
				values: z.record(z.string(), z.string()),
			}),
		)
		.mutation(async ({ input }) => {
			const { apiUrl } = getLanggraphConfig();
			const { threadId, values } = input;
			return await updateThreadState(apiUrl, threadId, values);
		}),

	// Delete thread
	deleteThread: t.procedure.input(z.string()).mutation(async ({ input }) => {
		const { apiUrl } = getLanggraphConfig();
		return await deleteThread(apiUrl, input);
	}),

	// Patch thread metadata
	patchThread: t.procedure
		.input(
			z.object({
				threadId: z.string(),
				metadata: z.record(z.string(), z.string()).optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const { apiUrl } = getLanggraphConfig();
			const { threadId, metadata } = input;
			return await patchThread(apiUrl, threadId, metadata);
		}),
});

export type LanggraphRouter = typeof langgraphRouter;
