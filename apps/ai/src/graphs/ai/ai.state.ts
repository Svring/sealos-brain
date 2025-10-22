import type { BaseMessage } from "@langchain/core/messages";
import { Annotation, messagesStateReducer } from "@langchain/langgraph";

// Main Graph State using Annotation method
export const GraphStateAnnotation = Annotation.Root({
	kubeconfig: Annotation<string>(),
	baseURL: Annotation<string>(),
	apiKey: Annotation<string>(),
	modelName: Annotation<string>(),
	messages: Annotation<BaseMessage[]>({
		reducer: messagesStateReducer,
	}),
	route: Annotation<"proposeNode" | "projectNode" | "resourceNode">(),
	trial: Annotation<boolean>(),
	projectContext: Annotation<any>(),
	resourceContext: Annotation<any>(),
});

export type GraphState = typeof GraphStateAnnotation.State;
