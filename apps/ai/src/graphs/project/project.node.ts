import { AIMessage } from "@langchain/core/messages";
import { Command, END } from "@langchain/langgraph";
import { getModel } from "@/lib/langgraph/langgraph.utils";
import { systemPrompt } from "./project.prompt";
import type { State } from "./project.state";
import { projectTools } from "./project.tool";

/**
 * Project agent based on the Sealos AI functionality.
 * Handles model binding, system prompts, and new tool calls.
 */
export async function projectNode(state: State) {
	try {
		const { messages, apiKey, baseURL, modelName } = state;

		const messageList = [systemPrompt, ...messages];

		const response = await getModel({ apiKey, baseURL, modelName })
			.bindTools(projectTools)
			.invoke(messageList);

		const hasToolCalls = response.tool_calls && response.tool_calls.length > 0;

		return hasToolCalls
			? { goto: "toolNode", messages: [response] }
			: new Command({ update: { messages: [response] }, goto: END });
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
