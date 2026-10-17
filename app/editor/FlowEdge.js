"use client";

import { BaseEdge } from "@xyflow/react";

const GAP = 24; // how far a line leaves a port before turning

// Right-angled connection. Target to the right: one vertical jog halfway between the blocks.
// Target behind or below: out, down the middle gap, back in, so it never crosses a block.
export default function FlowEdge({ sourceX, sourceY, targetX, targetY, markerEnd, style }) {
  let d;
  if (targetX >= sourceX + GAP * 2) {
    const midX = Math.round((sourceX + targetX) / 2);
    d = `M ${sourceX} ${sourceY} H ${midX} V ${targetY} H ${targetX}`;
  } else {
    const midY = Math.round((sourceY + targetY) / 2);
    d = `M ${sourceX} ${sourceY} H ${sourceX + GAP} V ${midY} H ${targetX - GAP} V ${targetY} H ${targetX}`;
  }
  return <BaseEdge path={d} markerEnd={markerEnd} style={style} />;
}
