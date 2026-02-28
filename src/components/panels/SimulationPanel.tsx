"use client";

import React, { useCallback, useEffect } from "react";
import { Play, Activity, Zap, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDesignStore } from "@/stores/useDesignStore";
import { useSimulationStore } from "@/stores/useSimulationStore";
import { simulate } from "@/lib/simulation";
import type { DesignNode } from "@/types/design";

export function SimulationPanel() {
  const nodes = useDesignStore((s) => s.nodes);
  const edges = useDesignStore((s) => s.edges);
  const config = useSimulationStore((s) => s.config);
  const result = useSimulationStore((s) => s.result);
  const setConfig = useSimulationStore((s) => s.setConfig);
  const setResult = useSimulationStore((s) => s.setResult);
  const autoSimulate = useSimulationStore((s) => s.autoSimulate);

  const runSimulation = useCallback(() => {
    if (nodes.length === 0) return;

    const simResult = simulate(nodes, edges, config);
    setResult(simResult);

    // Update node visuals
    const updatedNodes = nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        status: simResult.nodeMetrics[node.id]?.status ?? "healthy",
        metrics: simResult.nodeMetrics[node.id]
          ? {
              utilization: simResult.nodeMetrics[node.id].utilization,
              currentRps: simResult.nodeMetrics[node.id].currentRps,
              currentLatency: simResult.nodeMetrics[node.id].currentLatency,
            }
          : undefined,
      },
    })) as DesignNode[];

    useDesignStore.getState().setNodes(updatedNodes);
  }, [nodes, edges, config, setResult]);

  // Auto-simulate when config changes
  useEffect(() => {
    if (autoSimulate && nodes.length > 0) {
      const timer = setTimeout(runSimulation, 100);
      return () => clearTimeout(timer);
    }
  }, [config.usersPerSecond, config.trafficPattern, autoSimulate, runSimulation, nodes.length]);

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <Activity className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-sm">Generate a design to run simulations</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Traffic Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Traffic Load</Label>
          <Badge variant="outline" className="font-mono">
            {config.usersPerSecond.toLocaleString()} rps
          </Badge>
        </div>
        <Slider
          value={[config.usersPerSecond]}
          onValueChange={([v]) => setConfig({ usersPerSecond: v })}
          min={100}
          max={100000}
          step={100}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>100</span>
          <span>100K</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Traffic Pattern</Label>
        <Select
          value={config.trafficPattern}
          onValueChange={(v) =>
            setConfig({
              trafficPattern: v as "constant" | "spike" | "gradual_ramp" | "diurnal",
            })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="constant">Constant</SelectItem>
            <SelectItem value="spike">Traffic Spike (3x)</SelectItem>
            <SelectItem value="gradual_ramp">Gradual Ramp</SelectItem>
            <SelectItem value="diurnal">Diurnal (Day/Night)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={runSimulation}
        className="w-full gap-2"
        variant="default"
        size="sm"
      >
        <Play className="w-4 h-4" />
        Run Simulation
      </Button>

      <Separator />

      {/* Results */}
      {result && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Results</h3>

          <div className="grid grid-cols-2 gap-2">
            <MetricCard
              icon={<Clock className="w-3.5 h-3.5" />}
              label="Avg Latency"
              value={result.avgLatencyMs < 99999 ? `${result.avgLatencyMs}ms` : "∞"}
              status={result.avgLatencyMs > 500 ? "danger" : result.avgLatencyMs > 100 ? "warning" : "good"}
            />
            <MetricCard
              icon={<Clock className="w-3.5 h-3.5" />}
              label="P99 Latency"
              value={result.p99LatencyMs < 99999 ? `${result.p99LatencyMs}ms` : "∞"}
              status={result.p99LatencyMs > 1000 ? "danger" : result.p99LatencyMs > 300 ? "warning" : "good"}
            />
            <MetricCard
              icon={<Zap className="w-3.5 h-3.5" />}
              label="Throughput"
              value={`${formatNumber(result.throughputRps)} rps`}
              status="neutral"
            />
            <MetricCard
              icon={<Activity className="w-3.5 h-3.5" />}
              label="Saturation"
              value={`${formatNumber(result.saturationPoint)} rps`}
              status={config.usersPerSecond > result.saturationPoint ? "danger" : "good"}
            />
          </div>

          {/* Bottleneck */}
          {result.bottleneck !== "none" && (
            <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/20">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-yellow-700 dark:text-yellow-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Bottleneck Detected
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <p className="text-xs text-yellow-600 dark:text-yellow-500">
                  <span className="font-semibold">{result.bottleneck}</span> is
                  the primary bottleneck. Consider adding replicas or upgrading
                  capacity.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Node utilization breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">
              Component Utilization
            </h4>
            {Object.entries(result.nodeMetrics)
              .sort(([, a], [, b]) => b.utilization - a.utilization)
              .map(([nodeId, metrics]) => {
                const node = nodes.find((n) => n.id === nodeId);
                return (
                  <div key={nodeId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate max-w-[140px]">
                        {node?.data.label ?? nodeId}
                      </span>
                      <span
                        className={
                          metrics.utilization > 0.8
                            ? "text-red-500 font-semibold"
                            : metrics.utilization > 0.6
                              ? "text-yellow-500"
                              : "text-green-500"
                        }
                      >
                        {Math.round(metrics.utilization * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          metrics.utilization > 0.8
                            ? "bg-red-500"
                            : metrics.utilization > 0.6
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(metrics.utilization * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Cost estimate */}
          <Card>
            <CardContent className="pt-3 pb-3 px-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Est. Monthly Cost
                </span>
                <span className="text-sm font-semibold">
                  ${Math.round(result.estimatedMonthlyCost).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: "good" | "warning" | "danger" | "neutral";
}) {
  const statusColors = {
    good: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    danger: "text-red-600 dark:text-red-400",
    neutral: "text-gray-900 dark:text-gray-100",
  };

  return (
    <Card className="py-0">
      <CardContent className="p-2.5">
        <div className="flex items-center gap-1 text-muted-foreground mb-1">
          {icon}
          <span className="text-[10px]">{label}</span>
        </div>
        <p className={`text-sm font-bold ${statusColors[status]}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
