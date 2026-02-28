"use client";

import React, { useState, useCallback } from "react";
import { Sparkles, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDesignStore } from "@/stores/useDesignStore";
import { useSimulationStore } from "@/stores/useSimulationStore";
import { applyAutoLayout } from "@/hooks/useAutoLayout";
import { simulate } from "@/lib/simulation";
import type { DesignNode, DesignEdge, TrafficEstimation } from "@/types/design";

const EXAMPLE_PROMPTS = [
  "Design Netflix",
  "Design Uber",
  "Design Twitter",
  "Design WhatsApp",
  "Design YouTube",
  "Design Spotify",
];

export function PromptPanel() {
  const [input, setInput] = useState("");
  const isGenerating = useDesignStore((s) => s.isGenerating);
  const generationError = useDesignStore((s) => s.generationError);
  const setIsGenerating = useDesignStore((s) => s.setIsGenerating);
  const setGenerationError = useDesignStore((s) => s.setGenerationError);
  const setDesign = useDesignStore((s) => s.setDesign);
  const nodes = useDesignStore((s) => s.nodes);
  const edges = useDesignStore((s) => s.edges);

  const simConfig = useSimulationStore((s) => s.config);
  const setSimResult = useSimulationStore((s) => s.setResult);

  const handleGenerate = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || isGenerating) return;

      setIsGenerating(true);
      setGenerationError(null);

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim() }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to generate design");
        }

        // Apply auto-layout
        const layoutNodes = applyAutoLayout(
          data.nodes as DesignNode[],
          data.edges as DesignEdge[]
        );

        setDesign({
          nodes: layoutNodes,
          edges: data.edges,
          trafficEstimation: data.trafficEstimation as TrafficEstimation,
          explanation: data.explanation,
          prompt: prompt.trim(),
          name: prompt.trim(),
        });

        // Auto-run simulation
        const simResult = simulate(layoutNodes, data.edges, simConfig);
        setSimResult(simResult);

        // Apply metrics to nodes
        const nodesWithMetrics = layoutNodes.map((node) => ({
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

        useDesignStore.getState().setNodes(nodesWithMetrics);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        setGenerationError(message);
      } finally {
        setIsGenerating(false);
      }
    },
    [isGenerating, setIsGenerating, setGenerationError, setDesign, simConfig, setSimResult]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate(input);
  };

  const handleReset = () => {
    useDesignStore.getState().reset();
    useSimulationStore.getState().reset();
    setInput("");
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a system design prompt... e.g., Design Netflix"
            disabled={isGenerating}
            className="pr-4 h-10 bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700"
          />
        </div>
        <Button
          type="submit"
          disabled={isGenerating || !input.trim()}
          className="h-10 px-6 gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate
            </>
          )}
        </Button>
        {nodes.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="h-10 px-3"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </form>

      {/* Example prompts */}
      {nodes.length === 0 && !isGenerating && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground self-center">
            Try:
          </span>
          {EXAMPLE_PROMPTS.map((prompt) => (
            <Badge
              key={prompt}
              variant="secondary"
              className="cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors text-xs"
              onClick={() => {
                setInput(prompt);
                handleGenerate(prompt);
              }}
            >
              {prompt}
            </Badge>
          ))}
        </div>
      )}

      {/* Error display */}
      {generationError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700 dark:text-red-400">
              {generationError}
            </p>
            <Button
              variant="link"
              size="sm"
              className="text-red-600 p-0 h-auto mt-1"
              onClick={() => handleGenerate(input)}
            >
              Try again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
