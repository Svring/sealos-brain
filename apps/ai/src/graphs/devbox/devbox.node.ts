import { AIMessage } from "@langchain/core/messages";
import { Command, END } from "@langchain/langgraph";
import { getModel } from "@/lib/langgraph/langgraph.utils";
import { systemPrompt } from "./devbox.prompt";
import type { State } from "./devbox.state";
import { devboxTools } from "./devbox.tool";

/**
 * Devbox agent based on the Sealos AI functionality.
 * Handles model binding, system prompts, and new tool calls.
 */
export async function devboxNode(state: State) {
	try {
		const { messages, apiKey } = state;

		const messageList = [systemPrompt, ...messages];

		const response = await getModel({ apiKey })
			.bindTools(devboxTools)
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
						`Error in devbox deployment: ${error instanceof Error ? error.message : String(error)}`,
					),
				],
			},
			goto: END,
		});
	}
}
