"use client";

import { Handle, Position } from "@xyflow/react";

interface BaseNodeProps {
	children?: React.ReactNode;
	height?: number;
}

export const BaseNode = ({ children, height = 50 }: BaseNodeProps) => {
	// Determine the appropriate styling based on props
	const getNodeStyling = () => {
		let baseStyles =
			"relative cursor-pointer rounded-xl border bg-background-tertiary p-5 text-card-foreground hover:brightness-120";

		// Add height and width classes
		baseStyles += `h-50 h-${height} w-70`;

		return baseStyles;
	};

	return (
		<div className={getNodeStyling()}>
			<Handle position={Position.Top} type="source" />
			{children}
			<Handle position={Position.Bottom} type="target" />
		</div>
	);
};

BaseNode.displayName = "BaseNode";
