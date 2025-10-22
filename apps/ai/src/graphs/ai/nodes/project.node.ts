import {
	AIMessage,
	type BaseMessage,
	SystemMessage,
} from "@langchain/core/messages";
import { getModel } from "@/lib/langgraph/langgraph.utils";
import type { GraphState } from "../ai.state";

/**
 * Project management agent based on the Sealos AI functionality.
 * Handles model binding, system prompts, Sealos context, and tool calls.
 */
export async function projectNode(state: GraphState): Promise<{
	messages?: BaseMessage[];
	goto: "__end__";
}> {
	try {
		const { messages, baseURL, apiKey, modelName, projectContext } = state;

		// TODO: Initialize model with tools
		const model = getModel({
			modelName,
			baseURL,
			apiKey,
		});

		// const modelWithTools = model.bindTools(projectTools);

		// Build system message for project management
		const systemMessage = new SystemMessage(
			"You are a project management assistant for Sealos. " +
				"You help users manage their projects by creating, updating, and deleting resources. " +
				"Always provide clear and helpful responses about project operations.",
		);

		// Build message list with project context
		const messageList = [
			systemMessage,
			new SystemMessage(`Project Context: ${JSON.stringify(projectContext)}`),
			...(messages || []),
		];

		// TODO: Get model response
		// const response = await modelWithTools.invoke(messageList);

		// For now, return a placeholder response
		const response = new AIMessage(
			"Project management functionality will be implemented here.",
		);

		// Check if the response contains tool calls
		if (response.tool_calls && response.tool_calls.length > 0) {
			return {
				goto: "__end__",
				messages: [response],
			};
		} else {
			return {
				goto: "__end__",
				messages: [response],
			};
		}
	} catch (error) {
		// Handle any errors that occur during project management processing
		const errorMessage = `Error in project management: ${error instanceof Error ? error.message : String(error)}`;
		return {
			goto: "__end__",
			messages: [new AIMessage(errorMessage)],
		};
	}
}
