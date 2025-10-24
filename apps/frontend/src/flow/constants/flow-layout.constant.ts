import type { Node } from "@xyflow/react";

// Layout options matching the flowgraph machine
export const LAYOUT_OPTIONS = {
	direction: "BT",
	rankSep: 150,
	nodeSep: 150,
} as const;

export const SPLIT_OPTIONS = {
	groupId: "devbox-group",
	groupPadding: 20,
	gapBetweenGroupAndRest: 200,
	groupPosition: { x: -700, y: 0 },
	childNodeWidth: 280,
	childNodeHeight: 200,
	// Account for smaller network nodes inside the group
	// StatefulSet nodes are taller due to hem component
	getChildNodeSize: (node: Node) => {
		if (node.type === "network") {
			return { width: 280, height: 56 };
		}
		if (node.type === "statefulset") {
			return { width: 280, height: 240 }; // h-60 in Tailwind = 240px (hem component height)
		}
		return { width: 280, height: 200 };
	},
	// Treat network nodes as shorter than default nodes during outside layout
	// StatefulSet nodes are taller due to hem component
	getOutsideNodeSize: (node: Node) => {
		if (node.type === "network") {
			return { width: 280, height: 56 }; // h-14 in Tailwind = 56px
		}
		if (node.type === "statefulset") {
			return { width: 280, height: 240 }; // h-60 in Tailwind = 240px (hem component height)
		}
		return { width: 280, height: 200 };
	},
	groupLayoutOptions: {
		...LAYOUT_OPTIONS,
		edgeAware: true,
		barycentricIterations: 3,
	},
	outsideLayoutOptions: {
		...LAYOUT_OPTIONS,
		edgeAware: true,
		barycentricIterations: 3,
	},
} as const;
