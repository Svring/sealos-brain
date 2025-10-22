import { AIMessage, SystemMessage } from "@langchain/core/messages";
import type { Tool } from "@langchain/core/tools";
import { Command, END } from "@langchain/langgraph";
import { getModel } from "@/lib/langgraph/langgraph.utils";
import type { GraphState } from "../ai.state";

/**
 * Project deployment agent based on the Sealos AI functionality.
 * Handles model binding, system prompts, and deployment tool calls.
 */
export async function proposeNode(state: GraphState) {
	try {
		const { messages, baseURL, apiKey, modelName, trial } = state;

		// Use TRIAL_API_KEY if trial is true, otherwise use the provided apiKey
		const effectiveApiKey = trial ? process.env.TRIAL_API_KEY : apiKey;

		const model = getModel({
			baseURL,
			apiKey: effectiveApiKey || "",
			modelName,
		});

		const availableTools: Tool[] = [];

		const modelWithTools = model.bindTools(availableTools);

		// Build system message for project deployment
		const systemMessage = new SystemMessage(
			"You are a project deployment assistant for Sealos. " +
				"You help users deploy projects by creating the necessary infrastructure and applications. " +
				"Always provide clear and helpful responses about deployment operations.",
		);

		// Build message list
		const messageList = [systemMessage, ...(messages || [])];

		const response = await modelWithTools.invoke(messageList);

		// Check if the response contains tool calls
		if (response.tool_calls && response.tool_calls.length > 0) {
			return {
				goto: "__end__",
				messages: [response],
			};
		} else {
			return new Command({
				update: {
					messages: [response],
				},
				goto: END,
			});
		}
	} catch (error) {
		return new Command({
			update: {
				messages: [
					new AIMessage(
						`Error in project deployment: ${error instanceof Error ? error.message : String(error)}`,
					),
				],
			},
			goto: END,
		});
	}
}
