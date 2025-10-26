import { END, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { newNode } from "./new.node";
import { State } from "./new.state";
import { newTools } from "./new.tool";

const workflow = new StateGraph(State)
	.addNode("newNode", newNode)
	.addNode("toolNode", new ToolNode(newTools))
	.addEdge(START, "newNode")
	.addEdge("newNode", "toolNode")
	.addEdge("toolNode", END);

export const graph = workflow.compile();
