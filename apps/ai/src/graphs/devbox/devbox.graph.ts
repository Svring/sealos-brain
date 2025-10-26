import { END, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { devboxNode } from "./devbox.node";
import { State } from "./devbox.state";
import { devboxTools } from "./devbox.tool";

const workflow = new StateGraph(State)
	.addNode("devboxNode", devboxNode)
	.addNode("toolNode", new ToolNode(devboxTools))
	.addEdge(START, "devboxNode")
	.addEdge("devboxNode", "toolNode")
	.addEdge("toolNode", END);

export const graph = workflow.compile();
