import { END, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { launchpadNode } from "./launchpad.node";
import { State } from "./launchpad.state";
import { launchpadTools } from "./launchpad.tool";

const workflow = new StateGraph(State)
	.addNode("launchpadNode", launchpadNode)
	.addNode("toolNode", new ToolNode(launchpadTools))
	.addEdge(START, "launchpadNode")
	.addEdge("launchpadNode", "toolNode")
	.addEdge("toolNode", END);

export const graph = workflow.compile();
