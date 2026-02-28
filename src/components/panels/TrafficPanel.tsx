"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, Database, MemoryStick, HardDrive } from "lucide-react";
import type { TrafficEstimation } from "@/types/design";

interface TrafficPanelProps {
  estimation: TrafficEstimation;
}

export function TrafficPanel({ estimation }: TrafficPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          Traffic Estimation
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-2.5">
        <TrafficRow
          icon={<Users className="w-3.5 h-3.5" />}
          label="Daily Active Users"
          value={formatLargeNumber(estimation.dailyActiveUsers)}
        />
        <TrafficRow
          icon={<Activity className="w-3.5 h-3.5" />}
          label="Peak RPS"
          value={formatLargeNumber(estimation.peakRps)}
        />
        <TrafficRow
          icon={<Database className="w-3.5 h-3.5" />}
          label="Read:Write Ratio"
          value={`${estimation.readWriteRatio}:1`}
        />
        <TrafficRow
          icon={<MemoryStick className="w-3.5 h-3.5" />}
          label="Avg Request Size"
          value={`${estimation.avgRequestSizeKb} KB`}
        />
        <TrafficRow
          icon={<HardDrive className="w-3.5 h-3.5" />}
          label="Storage Growth"
          value={`${estimation.storageGrowthGbPerMonth} GB/mo`}
        />
      </CardContent>
    </Card>
  );
}

function TrafficRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      <Badge variant="secondary" className="font-mono text-[10px]">
        {value}
      </Badge>
    </div>
  );
}

function formatLargeNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
