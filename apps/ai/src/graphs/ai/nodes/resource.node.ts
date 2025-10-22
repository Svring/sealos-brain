import {
	AIMessage,
	type BaseMessage,
	SystemMessage,
} from "@langchain/core/messages";
import type { Tool } from "@langchain/core/tools";
import type { GraphState } from "../ai.state";

/**
 * Resource management agent based on the Sealos AI functionality.
 * Handles model binding, system prompts, Sealos context, and tool calls for individual resource management.
 * Dynamically selects tools based on the resource type from resource_context.
 */
export async function resourceNode(state: GraphState): Promise<{
	messages?: BaseMessage[];
	goto: "__end__";
}> {
	try {
		const { messages, baseURL, apiKey, modelName, resourceContext } = state;

		// TODO: Initialize model with tools
		// const model = getSealosModel({
		//   base_url,
		//   api_key,
		//   model_name
		// });

		// Dynamically select tools based on resource type
		const selectedTools: Tool[] = [];

		// TODO: Bind tools to model
		// const modelWithTools = model.bindTools(selectedTools, { parallel_tool_calls: false });

		// Build system message for resource management
		const systemMessage = new SystemMessage(
			"You are a resource management assistant for Sealos. " +
				"You help users manage individual resources like DevBoxes, Clusters, and Launchpads. " +
				"Always provide clear and helpful responses about resource operations.",
		);

		// Build message list with resource context emphasis
		const contextEmphasis = new SystemMessage(
			"IMPORTANT: The next message contains the newest resource context. " +
				"Pay close attention to it as it reflects the current state of the resource, " +
				"including any recent modifications like added ports, changed environment variables, " +
				"or updated configurations. Always use this latest context when answering questions or making decisions.",
		);

		const messageList = [
			systemMessage,
			contextEmphasis,
			new SystemMessage(
				`Resource Context: ${JSON.stringify(resourceContext)}`,
			),
			...(messages || []),
		];

		// TODO: Get model response
		// const response = await modelWithTools.invoke(messageList);

		// For now, return a placeholder response
		const response = new AIMessage(
			"Resource management functionality will be implemented here.",
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
		// Handle any errors that occur during resource management processing
		const errorMessage = `Error in resource management: ${error instanceof Error ? error.message : String(error)}`;
		return {
			goto: "__end__",
			messages: [new AIMessage(errorMessage)],
		};
	}
}
