import { initTRPC } from "@trpc/server";
import { z } from "zod";
import {
	createThread,
	deleteThread,
	getThread,
	listThreads,
	patchThread,
	searchThreads,
	updateThreadState,
} from "@/lib/langgraph/langgraph.api";
import { createErrorFormatter } from "@/lib/trpc/trpc.utils";

// Context creation function
export async function createLanggraphContext(opts: { req: Request }) {
	// TODO: Implement context creation
	return {};
}

export type LanggraphContext = Awaited<
	ReturnType<typeof createLanggraphContext>
>;

const t = initTRPC.context<LanggraphContext>().create(createErrorFormatter());

export const langgraphRouter = t.router({
	// ===== QUERY PROCEDURES =====

	// Thread Information
	listThreads: t.procedure
		.input(z.string().optional().default("threads"))
		.query(async () => {
			return await listThreads();
		}),

	getThread: t.procedure.input(z.string()).query(async ({ input }) => {
		return await getThread(input);
	}),

	searchThreads: t.procedure
		.input(
			z.object({
				metadata: z.record(z.any()),
			}),
		)
		.query(async ({ input }) => {
			return await searchThreads(input.metadata);
		}),

	// ===== MUTATION PROCEDURES =====

	// Thread Lifecycle Management
	createThread: t.procedure
		.input(
			z.object({
				metadata: z.record(z.any()),
			}),
		)
		.mutation(async ({ input }) => {
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
				metadata: metadata,
				supersteps,
			});
		}),

	// Update thread state
	updateThreadState: t.procedure
		.input(
			z.object({
				threadId: z.string(),
				values: z.record(z.any()),
			}),
		)
		.mutation(async ({ input }) => {
			const { threadId, values } = input;
			return await updateThreadState(threadId, values);
		}),

	// Delete thread
	deleteThread: t.procedure.input(z.string()).mutation(async ({ input }) => {
		return await deleteThread(input);
	}),

	// Patch thread metadata
	patchThread: t.procedure
		.input(
			z.object({
				threadId: z.string(),
				metadata: z.record(z.any()).optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const { threadId, metadata } = input;
			return await patchThread(threadId, metadata);
		}),
});

export type LanggraphRouter = typeof langgraphRouter;
