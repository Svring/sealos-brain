import { END, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { projectNode } from "./project.node";
import { State } from "./project.state";
import { projectTools } from "./project.tool";

const workflow = new StateGraph(State)
	.addNode("projectNode", projectNode)
	.addNode("toolNode", new ToolNode(projectTools))
	.addEdge(START, "projectNode")
	.addEdge("projectNode", "toolNode")
	.addEdge("toolNode", END);

export const graph = workflow.compile();
