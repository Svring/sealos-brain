import {
  BaseEdge,
  type EdgeProps,
  getSmoothStepPath,
  Position,
} from "@xyflow/react";

export default function StepEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, markerEnd, style, data } =
    props;

  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: Position.Top,
    targetPosition: Position.Bottom,
  });

  const handleClick = (event: React.MouseEvent) => {
    if (data?.onClick && typeof data.onClick === "function") {
      data.onClick(event);
    }
  };

  return (
    <BaseEdge
      id={id}
      path={path}
      markerEnd={markerEnd}
      style={style}
      onClick={handleClick}
    />
  );
}
