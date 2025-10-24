import {
	BaseEdge,
	type EdgeProps,
	getBezierPath,
	useInternalNode,
} from "@xyflow/react";
import { getEdgeParams } from "@/flow/utils/edge/edge.utils";

function FloatingErrorEdge(props: EdgeProps) {
	const { id, source, target, markerEnd } = props;

	const sourceNode = useInternalNode(source);
	const targetNode = useInternalNode(target);

	if (!sourceNode || !targetNode) {
		return null;
	}

	const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
		sourceNode,
		targetNode,
	);

	const [edgePath] = getBezierPath({
		sourceX: sx,
		sourceY: sy,
		sourcePosition: sourcePos,
		targetPosition: targetPos,
		targetX: tx,
		targetY: ty,
	});

	const errorColor = "#9F833B";

	const edgeStyle = {
		stroke: errorColor,
		strokeWidth: 1.5,
		strokeDasharray: "5,5", // Dashed line to indicate error state
		transition: "all 0.15s ease-in-out",
	};

	return (
		<g style={{ cursor: "help" }}>
			<BaseEdge
				id={id}
				path={edgePath}
				markerEnd={markerEnd}
				style={edgeStyle}
			/>
		</g>
	);
}

export default FloatingErrorEdge;
