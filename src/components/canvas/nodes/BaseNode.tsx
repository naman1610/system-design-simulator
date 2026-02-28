"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { SystemComponentData } from "@/types/components";
import { COMPONENT_REGISTRY } from "@/lib/templates/registry";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function BaseNodeComponent({ data, selected }: NodeProps & { data: SystemComponentData }) {
  const template = COMPONENT_REGISTRY[data.type];
  const Icon = template.icon;

  const statusColors: Record<string, string> = {
    healthy: "border-green-400 shadow-green-100",
    warning: "border-yellow-400 shadow-yellow-100",
    bottleneck: "border-red-400 shadow-red-200 animate-pulse",
    overloaded: "border-red-600 shadow-red-300 animate-pulse",
  };

  const statusBg: Record<string, string> = {
    healthy: "",
    warning: "bg-yellow-50/50 dark:bg-yellow-950/30",
    bottleneck: "bg-red-50/50 dark:bg-red-950/30",
    overloaded: "bg-red-100/50 dark:bg-red-950/50",
  };

  const status = data.status ?? "healthy";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "relative rounded-lg border-2 bg-white dark:bg-neutral-900 px-4 py-3 min-w-[180px] max-w-[220px] shadow-md transition-all duration-200",
            statusColors[status],
            statusBg[status],
            selected && "ring-2 ring-blue-500 ring-offset-2",
            template.bgColor
          )}
        >
          {/* Top handle */}
          <Handle
            type="target"
            position={Position.Top}
            className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
          />

          {/* Content */}
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex-shrink-0 mt-0.5 p-1.5 rounded-md bg-white dark:bg-neutral-800 shadow-sm",
                template.borderColor,
                "border"
              )}
            >
              <Icon className={cn("w-5 h-5", template.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                {data.label}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">
                {template.label}
              </p>
            </div>
          </div>

          {/* Metrics overlay (shown during simulation) */}
          {data.metrics && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {data.metrics.utilization !== undefined && (
                <Badge
                  variant={
                    data.metrics.utilization > 0.8
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-[9px] px-1.5 py-0"
                >
                  {Math.round(data.metrics.utilization * 100)}% util
                </Badge>
              )}
              {data.metrics.currentRps !== undefined && data.metrics.currentRps > 0 && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                  {formatRps(data.metrics.currentRps)} rps
                </Badge>
              )}
              {data.metrics.currentLatency !== undefined && data.metrics.currentLatency > 0 && data.metrics.currentLatency < 99999 && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                  {data.metrics.currentLatency}ms
                </Badge>
              )}
            </div>
          )}

          {/* Replicas indicator */}
          {(data.params.replicas ?? 1) > 1 && (
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
              ×{data.params.replicas}
            </div>
          )}

          {/* Bottom handle */}
          <Handle
            type="source"
            position={Position.Bottom}
            className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <p className="font-semibold">{data.label}</p>
        {data.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {data.description}
          </p>
        )}
        <div className="text-xs mt-2 space-y-0.5">
          {data.params.throughputRps && (
            <p>Capacity: {formatRps(data.params.throughputRps)} rps</p>
          )}
          {data.params.replicas && <p>Replicas: {data.params.replicas}</p>}
          {data.params.cacheHitRate !== undefined && (
            <p>Cache Hit Rate: {Math.round(data.params.cacheHitRate * 100)}%</p>
          )}
          {data.params.latencyMs !== undefined && (
            <p>Base Latency: {data.params.latencyMs}ms</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function formatRps(rps: number): string {
  if (rps >= 1000000) return `${(rps / 1000000).toFixed(1)}M`;
  if (rps >= 1000) return `${(rps / 1000).toFixed(1)}K`;
  return String(rps);
}

export const BaseNode = memo(BaseNodeComponent);
