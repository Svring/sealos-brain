import { END, START, StateGraph } from "@langchain/langgraph";
// Import state annotation
import { GraphStateAnnotation } from "./ai.state";
import { routeEdge } from "./edges/route.edge";
// Import nodes
import { projectNode } from "./nodes/project.node";
import { proposeNode } from "./nodes/propose.node";
import { resourceNode } from "./nodes/resource.node";

const workflow = new StateGraph(GraphStateAnnotation)
	.addNode("projectNode", projectNode)
	.addNode("resourceNode", resourceNode)
	.addNode("proposeNode", proposeNode)
	.addConditionalEdges(START, routeEdge, [
		"projectNode",
		"resourceNode",
		"proposeNode",
		END,
	]);

export const graph = workflow.compile();
