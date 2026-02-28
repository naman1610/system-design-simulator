"use client";

import React, { useMemo } from "react";
import { DollarSign, TrendingUp, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useDesignStore } from "@/stores/useDesignStore";
import { COMPONENT_REGISTRY } from "@/lib/templates/registry";
import type { ComponentType } from "@/types/components";

const HOURS_PER_MONTH = 730;

interface CostBreakdown {
  id: string;
  label: string;
  type: ComponentType;
  replicas: number;
  costPerHour: number;
  monthlyCost: number;
  color: string;
}

const TYPE_COLORS: Record<string, string> = {
  client: "#3b82f6",
  cdn: "#22c55e",
  load_balancer: "#a855f7",
  api_gateway: "#6366f1",
  microservice: "#0ea5e9",
  database: "#f97316",
  cache: "#ef4444",
  message_queue: "#eab308",
  storage: "#14b8a6",
  search_engine: "#06b6d4",
  notification_service: "#ec4899",
};

export function CostPanel() {
  const nodes = useDesignStore((s) => s.nodes);

  const { breakdown, totalMonthly, totalYearly } = useMemo(() => {
    const items: CostBreakdown[] = nodes.map((node) => {
      const type = node.data.type as ComponentType;
      const template = COMPONENT_REGISTRY[type];
      const replicas =
        node.data.params.replicas ?? template.defaultParams.replicas ?? 1;
      const costPerHour =
        node.data.params.costPerHourUsd ??
        template.defaultParams.costPerHourUsd ??
        0;
      const monthlyCost = costPerHour * HOURS_PER_MONTH * replicas;

      return {
        id: node.id,
        label: node.data.label,
        type,
        replicas,
        costPerHour,
        monthlyCost,
        color: TYPE_COLORS[type] ?? "#94a3b8",
      };
    });

    const sorted = items.sort((a, b) => b.monthlyCost - a.monthlyCost);
    const total = sorted.reduce((s, i) => s + i.monthlyCost, 0);

    return {
      breakdown: sorted,
      totalMonthly: total,
      totalYearly: total * 12,
    };
  }, [nodes]);

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <DollarSign className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-sm">Generate a design to see cost estimates</p>
      </div>
    );
  }

  const chartData = breakdown
    .filter((b) => b.monthlyCost > 0)
    .slice(0, 8)
    .map((b) => ({
      name: b.label.length > 14 ? b.label.slice(0, 12) + "…" : b.label,
      cost: Math.round(b.monthlyCost),
      color: b.color,
    }));

  return (
    <div className="space-y-4 p-4">
      {/* Total cost cards */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="py-0">
          <CardContent className="p-2.5">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="text-[10px]">Monthly</span>
            </div>
            <p className="text-sm font-bold">
              ${Math.round(totalMonthly).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="py-0">
          <CardContent className="p-2.5">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[10px]">Yearly</span>
            </div>
            <p className="text-sm font-bold">
              ${Math.round(totalYearly).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost chart */}
      {chartData.length > 0 && (
        <div className="w-full h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 9 }}
                tickFormatter={(v) =>
                  v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v}`
                }
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 9 }}
                width={90}
              />
              <RechartsTooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
                formatter={(value: unknown) => [
                  `$${Number(value).toLocaleString()}/mo`,
                  "Cost",
                ]}
              />
              <Bar dataKey="cost" radius={[0, 4, 4, 0]} barSize={16}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <Separator />

      {/* Detailed breakdown */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">
          Cost Breakdown
        </h4>
        {breakdown.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate max-w-[120px]">{item.label}</span>
              {item.replicas > 1 && (
                <Badge variant="outline" className="text-[9px] px-1 py-0">
                  <Server className="w-2.5 h-2.5 mr-0.5" />
                  {item.replicas}
                </Badge>
              )}
            </div>
            <span className="font-mono text-muted-foreground">
              ${Math.round(item.monthlyCost).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Cost tier hint */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-1 pt-2 px-3">
          <CardTitle className="text-[10px] font-medium text-muted-foreground">
            Infrastructure Tier
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <p className="text-xs font-medium">
            {totalMonthly < 500
              ? "Startup / Development"
              : totalMonthly < 5000
                ? "Growth / Mid-scale"
                : totalMonthly < 50000
                  ? "Enterprise / High-scale"
                  : "Hyperscale"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {totalMonthly < 500
              ? "Suitable for small teams and early-stage products"
              : totalMonthly < 5000
                ? "Typical for B2B SaaS with moderate traffic"
                : totalMonthly < 50000
                  ? "Large-scale consumer or enterprise workloads"
                  : "Top-tier scale (Netflix, Uber class)"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
