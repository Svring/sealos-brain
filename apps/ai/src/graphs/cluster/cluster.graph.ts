import { END, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { clusterNode } from "./cluster.node";
import { State } from "./cluster.state";
import { clusterTools } from "./cluster.tool";

const workflow = new StateGraph(State)
	.addNode("clusterNode", clusterNode)
	.addNode("toolNode", new ToolNode(clusterTools))
	.addEdge(START, "clusterNode")
	.addEdge("clusterNode", "toolNode")
	.addEdge("toolNode", END);

export const graph = workflow.compile();
