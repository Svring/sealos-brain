import { END } from "@langchain/langgraph";
import type { GraphState } from "../ai.state";

export const routeEdge = (
	state: GraphState,
): "__end__" | "proposeNode" | "projectNode" | "resourceNode" => {
	const { route } = state;

	switch (route) {
		case "proposeNode":
			return "proposeNode";

		case "projectNode":
			return "projectNode";

		case "resourceNode":
			return "resourceNode";

		default:
			return END;
	}
};
