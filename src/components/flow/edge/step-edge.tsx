import { BaseEdge, type EdgeProps, getSmoothStepPath } from "@xyflow/react";

export default function StepEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, data, ...rest } = props;

  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    // sourcePosition: Position.Right,
    targetX,
    targetY,
    // targetPosition: Position.Left,
  });

  const handleClick = (event: React.MouseEvent) => {
    // Call the onClick handler from data if it exists
    if (data?.onClick && typeof data.onClick === "function") {
      data.onClick(event);
    }
  };

  return (
    <>
      <BaseEdge id={id} onClick={handleClick} path={path} {...rest} />
    </>
  );
}
