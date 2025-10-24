import type { Edge, Node } from "@xyflow/react";
import { z } from "zod";

// Position schema
export const PositionSchema = z.object({
	x: z.number(),
	y: z.number(),
});

// LayoutOptions schema
export const LayoutOptionsSchema = z.object({
	direction: z.enum(["TB", "BT", "LR", "RL"]).optional(),
	nodeWidth: z.number().optional(),
	nodeHeight: z.number().optional(),
	rankSep: z.number().optional(),
	nodeSep: z.number().optional(),
	getNodeSize: z.function().optional(),
	edgeAware: z.boolean().optional(),
	barycentricIterations: z.number().optional(),
});

// DefaultLayoutOptions schema
export const DefaultLayoutOptionsSchema = LayoutOptionsSchema.required({
	direction: true,
	nodeWidth: true,
	nodeHeight: true,
	rankSep: true,
	nodeSep: true,
	edgeAware: true,
	barycentricIterations: true,
}).omit({
	getNodeSize: true,
});

// SplitLayoutOptions schema
export const SplitLayoutOptionsSchema = z.object({
	groupId: z.string().optional(),
	groupPadding: z.number().optional(),
	gapBetweenGroupAndRest: z.number().optional(),
	groupPosition: PositionSchema.optional(),
	childNodeWidth: z.number().optional(),
	childNodeHeight: z.number().optional(),
	getChildNodeSize: z.function().optional(),
	getOutsideNodeSize: z.function().optional(),
	edgeClearance: z.number().optional(),
	autoResizeGroup: z.boolean().optional(),
	groupLayoutOptions: LayoutOptionsSchema.optional(),
	outsideLayoutOptions: LayoutOptionsSchema.optional(),
});

// Type exports
export type Position = z.infer<typeof PositionSchema>;
export type LayoutOptions = z.infer<typeof LayoutOptionsSchema>;
export type DefaultLayoutOptions = z.infer<typeof DefaultLayoutOptionsSchema>;
export type SplitLayoutOptions = z.infer<typeof SplitLayoutOptionsSchema>;

// Re-export Edge and Node types from @xyflow/react
export type { Edge, Node };
