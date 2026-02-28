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
  ReferenceLine,
} from "recharts";
import type { ScalingDataPoint } from "@/types/simulation";

interface ScalingChartProps {
  data: ScalingDataPoint[];
}

export function ScalingChart({ data }: ScalingChartProps) {
  if (data.length === 0) return null;

  const maxThroughput = Math.max(...data.map((d) => d.throughput));
  const optimalServers = data.find(
    (d) => d.throughput === maxThroughput
  )?.servers;

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="servers"
            tick={{ fontSize: 10 }}
            label={{
              value: "Servers",
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
              value: "Throughput (rps)",
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
            formatter={(value: unknown) => [
              `${Number(value).toLocaleString()} rps`,
              "Throughput",
            ]}
            labelFormatter={(label: unknown) => `${label} servers`}
          />
          {optimalServers && (
            <ReferenceLine
              x={optimalServers}
              stroke="#22c55e"
              strokeDasharray="4 2"
              label={{
                value: "Optimal",
                position: "top",
                style: { fontSize: 9, fill: "#22c55e" },
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="throughput"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
