"use client";

import { createContext, use, useCallback } from "react";
import type { EventFrom, StateFrom } from "xstate";
import type { flowMachine } from "./flow.state";

interface FlowContextValue {
	nodes: unknown[];
	edges: unknown[];
	state: StateFrom<typeof flowMachine>;
	send: (event: EventFrom<typeof flowMachine>) => void;
}

export const flowMachineContext = createContext<FlowContextValue | undefined>(
	undefined,
);

export function useFlowContext() {
	const ctx = use(flowMachineContext);
	if (!ctx) {
		throw new Error("useFlowContext must be used within FlowAdapter");
	}
	return ctx;
}

export function useFlowState() {
	const { state } = useFlowContext();

	if (state.matches("failed")) {
		throw new Error("Flow initialization failed");
	}

	return {
		nodes: state.context.nodes,
		edges: state.context.edges,
		isIdle: state.matches("idle"),
		isReady: state.matches("ready"),
		isFailed: state.matches("failed"),
	};
}

export function useFlowEvents() {
	const { send } = useFlowContext();

	return {
		setNodes: useCallback(
			(nodes: unknown[]) => send({ type: "SET_NODES", nodes }),
			[send],
		),
		addNode: useCallback(
			(node: unknown) => send({ type: "ADD_NODE", node }),
			[send],
		),
		updateNode: useCallback(
			(node: unknown) => send({ type: "UPDATE_NODE", node }),
			[send],
		),
		removeNode: useCallback(
			(nodeId: string) => send({ type: "REMOVE_NODE", nodeId }),
			[send],
		),
		setEdges: useCallback(
			(edges: unknown[]) => send({ type: "SET_EDGES", edges }),
			[send],
		),
		addEdge: useCallback(
			(edge: unknown) => send({ type: "ADD_EDGE", edge }),
			[send],
		),
		updateEdge: useCallback(
			(edge: unknown) => send({ type: "UPDATE_EDGE", edge }),
			[send],
		),
		removeEdge: useCallback(
			(edgeId: string) => send({ type: "REMOVE_EDGE", edgeId }),
			[send],
		),
		clearFlow: useCallback(() => send({ type: "CLEAR_FLOW" }), [send]),
		fail: useCallback(() => send({ type: "FAIL" }), [send]),
		retry: useCallback(() => send({ type: "RETRY" }), [send]),
	};
}
