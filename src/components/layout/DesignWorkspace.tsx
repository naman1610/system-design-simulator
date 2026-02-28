"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PromptPanel } from "@/components/panels/PromptPanel";
import { SimulationPanel } from "@/components/panels/SimulationPanel";
import { NodeDetailPanel } from "@/components/panels/NodeDetailPanel";
import { TrafficPanel } from "@/components/panels/TrafficPanel";
import { LatencyChart } from "@/components/charts/LatencyChart";
import { ScalingChart } from "@/components/charts/ScalingChart";
import { useDesignStore } from "@/stores/useDesignStore";
import { useSimulationStore } from "@/stores/useSimulationStore";
import { Activity, Settings, BarChart3, Cpu, Loader2, DollarSign } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { ExportMenu } from "@/components/export-menu";
import { CostPanel } from "@/components/panels/CostPanel";
import { TemplatePalette } from "@/components/panels/TemplatePalette";
import { HistoryPanel } from "@/components/panels/HistoryPanel";

// Dynamic import for React Flow (client-only)
const DesignCanvas = dynamic(
  () =>
    import("@/components/canvas/DesignCanvas").then((m) => ({
      default: m.DesignCanvas,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

export default function DesignWorkspace() {
  const nodes = useDesignStore((s) => s.nodes);
  const explanation = useDesignStore((s) => s.explanation);
  const trafficEstimation = useDesignStore((s) => s.trafficEstimation);
  const isGenerating = useDesignStore((s) => s.isGenerating);
  const result = useSimulationStore((s) => s.result);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b bg-white dark:bg-neutral-900 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold tracking-tight">
              System Design Simulator
            </h1>
          </div>
          {nodes.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {nodes.length} components
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <HistoryPanel />
            <ExportMenu />
            <ThemeToggle />
          </div>
        </div>
        <PromptPanel />
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Component palette (left) */}
        {nodes.length > 0 && (
          <TemplatePalette className="w-[180px] border-r bg-white dark:bg-neutral-900 flex flex-col overflow-hidden flex-shrink-0" />
        )}

        {/* Canvas area */}
        <div className="flex-1 relative">
          {nodes.length === 0 && !isGenerating ? (
            <EmptyState />
          ) : isGenerating ? (
            <GeneratingState />
          ) : (
            <DesignCanvas />
          )}
        </div>

        {/* Right sidebar */}
        {nodes.length > 0 && (
          <div className="w-[340px] border-l bg-white dark:bg-neutral-900 flex flex-col overflow-hidden flex-shrink-0">
            <Tabs defaultValue="simulation" className="flex flex-col h-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-10 px-2 flex-shrink-0">
                <TabsTrigger
                  value="simulation"
                  className="gap-1.5 text-xs data-[state=active]:shadow-sm"
                >
                  <Activity className="w-3.5 h-3.5" />
                  Simulation
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="gap-1.5 text-xs data-[state=active]:shadow-sm"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="charts"
                  className="gap-1.5 text-xs data-[state=active]:shadow-sm"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Charts
                </TabsTrigger>
                <TabsTrigger
                  value="costs"
                  className="gap-1.5 text-xs data-[state=active]:shadow-sm"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Costs
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <TabsContent value="simulation" className="mt-0">
                  <SimulationPanel />
                  {trafficEstimation && (
                    <div className="px-4 pb-4">
                      <TrafficPanel estimation={trafficEstimation} />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="details" className="mt-0">
                  <NodeDetailPanel />
                </TabsContent>

                <TabsContent value="charts" className="mt-0 p-4 space-y-4">
                  {result ? (
                    <>
                      <div>
                        <h3 className="text-sm font-semibold mb-2">
                          Latency vs Load
                        </h3>
                        <LatencyChart data={result.latencyDistribution} />
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-semibold mb-2">
                          Scaling Curve (USL)
                        </h3>
                        <ScalingChart data={result.scalingData} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mb-4 opacity-30" />
                      <p className="text-sm">
                        Run a simulation to see charts
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="costs" className="mt-0">
                  <CostPanel />
                </TabsContent>
              </ScrollArea>
            </Tabs>

            {/* Explanation */}
            {explanation && (
              <div className="border-t p-4 flex-shrink-0 max-h-[200px] overflow-y-auto">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                  Architecture Explanation
                </h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center">
          <Cpu className="w-12 h-12 text-blue-500/50" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg animate-bounce">
          <Activity className="w-4 h-4 text-white" />
        </div>
      </div>
      <h2 className="text-xl font-bold mb-2">Design Any System</h2>
      <p className="text-muted-foreground text-sm max-w-md">
        Enter a system design prompt above to auto-generate a high-level
        architecture diagram with real-time bottleneck simulation.
      </p>
      <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="font-medium">AI-Generated</p>
          <p className="mt-1 text-[10px]">HLD diagrams</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="font-medium">Live Simulation</p>
          <p className="mt-1 text-[10px]">Bottleneck analysis</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="font-medium">Interactive</p>
          <p className="mt-1 text-[10px]">Tune & explore</p>
        </div>
      </div>
    </div>
  );
}

function GeneratingState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center animate-pulse">
          <Cpu className="w-10 h-10 text-blue-500/50" />
        </div>
      </div>
      <Loader2 className="w-6 h-6 animate-spin text-primary mb-4" />
      <h3 className="text-sm font-semibold mb-1">Generating Architecture...</h3>
      <p className="text-xs text-muted-foreground">
        AI is designing your system. This takes 2-5 seconds.
      </p>
    </div>
  );
}
