"use client";

import type { Edge, Node } from "@xyflow/react";
import { assign, createMachine } from "xstate";

export interface FlowContext {
	nodes: Node[];
	edges: Edge[];
}

export type FlowEvent =
	| { type: "SET_NODES"; nodes: Node[] }
	| { type: "ADD_NODE"; node: Node }
	| { type: "UPDATE_NODE"; node: Node }
	| { type: "REMOVE_NODE"; nodeId: string }
	| { type: "SET_EDGES"; edges: Edge[] }
	| { type: "ADD_EDGE"; edge: Edge }
	| { type: "UPDATE_EDGE"; edge: Edge }
	| { type: "REMOVE_EDGE"; edgeId: string }
	| { type: "CLEAR_FLOW" }
	| { type: "FAIL" }
	| { type: "RETRY" };

export const flowMachine = createMachine({
	types: {} as {
		context: FlowContext;
		events: FlowEvent;
	},
	id: "flow",
	initial: "idle",
	context: {
		nodes: [],
		edges: [],
	},
	states: {
		idle: {
			on: {
				SET_NODES: {
					target: "ready",
					actions: assign({ nodes: ({ event }) => event.nodes }),
				},
				ADD_NODE: {
					target: "ready",
					actions: assign({
						nodes: ({ context, event }) => [...context.nodes, event.node],
					}),
				},
				FAIL: {
					target: "failed",
				},
			},
		},
		ready: {
			on: {
				SET_NODES: {
					actions: assign({ nodes: ({ event }) => event.nodes }),
				},
				ADD_NODE: {
					actions: assign({
						nodes: ({ context, event }) => [...context.nodes, event.node],
					}),
				},
				UPDATE_NODE: {
					actions: assign({
						nodes: ({ context, event }) =>
							context.nodes.map((node) =>
								node.id === event.node.id ? event.node : node,
							),
					}),
				},
				REMOVE_NODE: {
					actions: assign({
						nodes: ({ context, event }) =>
							context.nodes.filter((node) => node.id !== event.nodeId),
						edges: ({ context, event }) =>
							context.edges.filter(
								(edge) =>
									edge.source !== event.nodeId && edge.target !== event.nodeId,
							),
					}),
				},
				SET_EDGES: {
					actions: assign({ edges: ({ event }) => event.edges }),
				},
				ADD_EDGE: {
					actions: assign({
						edges: ({ context, event }) => [...context.edges, event.edge],
					}),
				},
				UPDATE_EDGE: {
					actions: assign({
						edges: ({ context, event }) =>
							context.edges.map((edge) =>
								edge.id === event.edge.id ? event.edge : edge,
							),
					}),
				},
				REMOVE_EDGE: {
					actions: assign({
						edges: ({ context, event }) =>
							context.edges.filter((edge) => edge.id !== event.edgeId),
					}),
				},
				CLEAR_FLOW: {
					actions: assign({
						nodes: [],
						edges: [],
					}),
				},
				FAIL: {
					target: "failed",
				},
			},
		},
		failed: {
			on: {
				SET_NODES: {
					target: "ready",
					actions: assign({ nodes: ({ event }) => event.nodes }),
				},
				ADD_NODE: {
					target: "ready",
					actions: assign({
						nodes: ({ context, event }) => [...context.nodes, event.node],
					}),
				},
				RETRY: "idle",
			},
		},
	},
});
