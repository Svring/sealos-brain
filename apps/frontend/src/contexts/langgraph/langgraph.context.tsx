"use client";

import { createContext, use, useCallback } from "react";
import type { EventFrom, StateFrom } from "xstate";
import type { GraphState, langgraphMachine, Message } from "./langgraph.state";

interface LangGraphContextValue {
	graphState: GraphState;
	deploymentUrl: string;
	graphId: string;
	state: StateFrom<typeof langgraphMachine>;
	send: (event: EventFrom<typeof langgraphMachine>) => void;
}

export const langgraphMachineContext = createContext<
	LangGraphContextValue | undefined
>(undefined);

export function useLangGraphContext() {
	const ctx = use(langgraphMachineContext);
	if (!ctx) {
		throw new Error("useLangGraphContext must be used within LangGraphAdapter");
	}
	return ctx;
}

export function useLangGraphState() {
	const { state } = useLangGraphContext();

	// Ensure langgraph is ready, throw error if not
	if (state.matches("initializing")) {
		throw new Error("LangGraph is still initializing");
	}

	if (state.matches("failed")) {
		throw new Error("LangGraph initialization failed");
	}

	if (!state.context) {
		throw new Error("No LangGraph configuration available");
	}

	// Directly expose the data fields
	return {
		graphState: state.context.graphState,
		deploymentUrl: state.context.deploymentUrl,
		graphId: state.context.graphId,
		isInitializing: state.matches("initializing"),
		isReady: state.matches("ready"),
		isFailed: state.matches("failed"),
	};
}

export function useLangGraphEvents() {
	const { send } = useLangGraphContext();

	return {
		setGraphState: useCallback(
			(graphState: Partial<GraphState>) =>
				send({
					type: "SET_GRAPH_STATE",
					graphState,
				}),
			[send],
		),
		setDeploymentUrl: useCallback(
			(deploymentUrl: string) =>
				send({ type: "SET_DEPLOYMENT_URL", deploymentUrl }),
			[send],
		),
		setGraphId: useCallback(
			(graphId: string) => send({ type: "SET_GRAPH_ID", graphId }),
			[send],
		),
		setDeployment: useCallback(
			(deploymentUrl: string, graphId: string) =>
				send({ type: "SET_DEPLOYMENT", deploymentUrl, graphId }),
			[send],
		),
		updateGraphState: useCallback(
			(graphState: Partial<GraphState>) =>
				send({ type: "UPDATE_GRAPH_STATE", graphState }),
			[send],
		),
		addMessage: useCallback(
			(message: Message) => send({ type: "ADD_MESSAGE", message }),
			[send],
		),
		fail: useCallback(() => send({ type: "FAIL" }), [send]),
		retry: useCallback(() => send({ type: "RETRY" }), [send]),
	};
}
