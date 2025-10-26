"use client";

import type { Edge, Node } from "@xyflow/react";
import { createContext, use, useCallback } from "react";
import type { EventFrom, StateFrom } from "xstate";
import type { Chat } from "../copilot/copilot.state";
import type { Resource } from "../project/project.state";
import type { flowMachine } from "./flow.state";

interface FlowContextValue {
	nodes: Node[];
	edges: Edge[];
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
		selectedNodeId: state.context.selectedNodeId,
		selectedEdgeId: state.context.selectedEdgeId,
		isIdle: state.matches("idle"),
		isReady: state.matches("ready"),
		isFailed: state.matches("failed"),
	};
}

export function useFlowEvents() {
	const { send } = useFlowContext();

	return {
		setNodes: useCallback(
			(nodes: Node[]) => send({ type: "SET_NODES", nodes }),
			[send],
		),
		addNode: useCallback(
			(node: Node) => send({ type: "ADD_NODE", node }),
			[send],
		),
		updateNode: useCallback(
			(node: Node) => send({ type: "UPDATE_NODE", node }),
			[send],
		),
		removeNode: useCallback(
			(nodeId: string) => send({ type: "REMOVE_NODE", nodeId }),
			[send],
		),
		setEdges: useCallback(
			(edges: Edge[]) => send({ type: "SET_EDGES", edges }),
			[send],
		),
		addEdge: useCallback(
			(edge: Edge) => send({ type: "ADD_EDGE", edge }),
			[send],
		),
		updateEdge: useCallback(
			(edge: Edge) => send({ type: "UPDATE_EDGE", edge }),
			[send],
		),
		removeEdge: useCallback(
			(edgeId: string) => send({ type: "REMOVE_EDGE", edgeId }),
			[send],
		),
		selectNode: useCallback(
			(nodeId: string | null, resource?: Resource, chat?: Omit<Chat, "uid">) =>
				send({ type: "SELECT_NODE", nodeId, resource, chat }),
			[send],
		),
		selectEdge: useCallback(
			(edgeId: string | null) => send({ type: "SELECT_EDGE", edgeId }),
			[send],
		),
		clearSelection: useCallback(() => {
			send({ type: "SELECT_NODE", nodeId: null });
			send({ type: "SELECT_EDGE", edgeId: null });
		}, [send]),
		clearFlow: useCallback(() => send({ type: "CLEAR_FLOW" }), [send]),
		fail: useCallback(() => send({ type: "FAIL" }), [send]),
		retry: useCallback(() => send({ type: "RETRY" }), [send]),
	};
}
