import { Position, getSmoothStepPath, BaseEdge, type EdgeProps } from '@xyflow/react';

export default function StepEdge({ id, sourceX, sourceY, targetX, targetY }: EdgeProps) {

  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    // sourcePosition: Position.Right,
    targetX,
    targetY,
    // targetPosition: Position.Left,
  });

  return (
    <>
      <BaseEdge id={id} path={path} />
    </>
  )
}