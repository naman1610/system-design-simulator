"use client";

import React, { memo } from "react";
import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import type { DesignEdgeData } from "@/types/design";

function CustomEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps & { data?: DesignEdgeData }) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const isAsync = data?.protocol === "async";

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? "#3b82f6" : isAsync ? "#eab308" : "#94a3b8",
          strokeWidth: selected ? 2.5 : 1.5,
          strokeDasharray: isAsync ? "6 4" : undefined,
        }}
      />
      {data?.label && (
        <foreignObject
          x={labelX - 50}
          y={labelY - 10}
          width={100}
          height={24}
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div className="flex items-center justify-center">
            <span className="bg-white dark:bg-neutral-800 text-[10px] text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded border border-gray-200 dark:border-neutral-700 shadow-sm whitespace-nowrap">
              {data.label}
              {data.protocol && data.protocol !== "http" && (
                <span className="ml-1 text-gray-400 uppercase text-[8px]">
                  {data.protocol}
                </span>
              )}
            </span>
          </div>
        </foreignObject>
      )}
    </>
  );
}

export const CustomEdge = memo(CustomEdgeComponent);

export const edgeTypes = {
  smoothstep: CustomEdge,
};
