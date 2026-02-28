"use client";

import React, { useCallback } from "react";
import { Settings, Server, Gauge, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDesignStore } from "@/stores/useDesignStore";
import { COMPONENT_REGISTRY } from "@/lib/templates/registry";
import type { ComponentType } from "@/types/components";

export function NodeDetailPanel() {
  const selectedNodeId = useDesignStore((s) => s.selectedNodeId);
  const nodes = useDesignStore((s) => s.nodes);
  const updateNodeParams = useDesignStore((s) => s.updateNodeParams);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const handleParamChange = useCallback(
    (param: string, value: number) => {
      if (!selectedNodeId) return;
      updateNodeParams(selectedNodeId, { [param]: value });
    },
    [selectedNodeId, updateNodeParams]
  );

  if (!selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <Settings className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-sm">Click a node to view details</p>
      </div>
    );
  }

  const type = selectedNode.data.type as ComponentType;
  const template = COMPONENT_REGISTRY[type];
  const Icon = template.icon;
  const params = selectedNode.data.params;
  const metrics = selectedNode.data.metrics;

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg border ${template.borderColor} ${template.bgColor}`}
        >
          <Icon className={`w-5 h-5 ${template.color}`} />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{selectedNode.data.label}</h3>
          <p className="text-xs text-muted-foreground">{template.label}</p>
        </div>
      </div>

      {selectedNode.data.description && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {selectedNode.data.description}
        </p>
      )}

      <Separator />

      {/* Live Metrics */}
      {metrics && (
        <>
          <div className="space-y-2">
            <h4 className="text-xs font-medium flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5" />
              Live Metrics
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {metrics.utilization !== undefined && (
                <MiniMetric
                  label="Utilization"
                  value={`${Math.round(metrics.utilization * 100)}%`}
                  color={
                    metrics.utilization > 0.8
                      ? "text-red-500"
                      : metrics.utilization > 0.6
                        ? "text-yellow-500"
                        : "text-green-500"
                  }
                />
              )}
              {metrics.currentRps !== undefined && (
                <MiniMetric
                  label="Current RPS"
                  value={metrics.currentRps.toLocaleString()}
                />
              )}
              {metrics.currentLatency !== undefined && metrics.currentLatency < 99999 && (
                <MiniMetric
                  label="Latency"
                  value={`${metrics.currentLatency}ms`}
                />
              )}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Parameters */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5" />
          Parameters
        </h4>

        {/* Replicas */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-1.5">
              <Server className="w-3 h-3" />
              Replicas
            </Label>
            <Badge variant="outline" className="font-mono text-[10px]">
              {params.replicas ?? 1}
            </Badge>
          </div>
          <Slider
            value={[params.replicas ?? 1]}
            onValueChange={([v]) => handleParamChange("replicas", v)}
            min={1}
            max={20}
            step={1}
          />
        </div>

        {/* Throughput */}
        {params.throughputRps !== undefined && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1.5">
                <Zap className="w-3 h-3" />
                Capacity (rps/node)
              </Label>
            </div>
            <Input
              type="number"
              value={params.throughputRps}
              onChange={(e) =>
                handleParamChange(
                  "throughputRps",
                  parseInt(e.target.value) || 0
                )
              }
              className="h-8 text-xs"
            />
          </div>
        )}

        {/* Cache hit rate */}
        {params.cacheHitRate !== undefined && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Cache Hit Rate</Label>
              <Badge variant="outline" className="font-mono text-[10px]">
                {Math.round(params.cacheHitRate * 100)}%
              </Badge>
            </div>
            <Slider
              value={[params.cacheHitRate * 100]}
              onValueChange={([v]) =>
                handleParamChange("cacheHitRate", v / 100)
              }
              min={0}
              max={100}
              step={1}
            />
          </div>
        )}

        {/* Base latency */}
        {params.latencyMs !== undefined && (
          <div className="space-y-1.5">
            <Label className="text-xs">Base Latency (ms)</Label>
            <Input
              type="number"
              value={params.latencyMs}
              onChange={(e) =>
                handleParamChange("latencyMs", parseInt(e.target.value) || 0)
              }
              className="h-8 text-xs"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  color = "text-foreground",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Card className="py-0">
      <CardContent className="p-2">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className={`text-xs font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
