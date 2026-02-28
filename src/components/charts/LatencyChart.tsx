"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { LatencyDataPoint } from "@/types/simulation";

interface LatencyChartProps {
  data: LatencyDataPoint[];
}

export function LatencyChart({ data }: LatencyChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="load"
            tick={{ fontSize: 10 }}
            tickFormatter={(v) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
            }
            label={{
              value: "Load (rps)",
              position: "insideBottom",
              offset: -2,
              style: { fontSize: 10 },
            }}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickFormatter={(v) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
            }
            label={{
              value: "Latency (ms)",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 10 },
            }}
          />
          <RechartsTooltip
            contentStyle={{
              fontSize: 11,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
            formatter={(value: unknown, name: unknown) => [
              `${Number(value).toLocaleString()}ms`,
              name === "avgLatency" ? "Avg Latency" : "P99 Latency",
            ]}
            labelFormatter={(label: unknown) =>
              `Load: ${Number(label).toLocaleString()} rps`
            }
          />
          <Legend
            wrapperStyle={{ fontSize: 10 }}
            formatter={(value: string) =>
              value === "avgLatency" ? "Avg Latency" : "P99 Latency"
            }
          />
          <Line
            type="monotone"
            dataKey="avgLatency"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="p99Latency"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            strokeDasharray="4 2"
            activeDot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
