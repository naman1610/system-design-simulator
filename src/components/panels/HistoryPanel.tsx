"use client";

import React, { useState } from "react";
import { History, Trash2, Upload, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHistoryStore, type SavedDesign } from "@/stores/useHistoryStore";
import { useDesignStore } from "@/stores/useDesignStore";
import { useSimulationStore } from "@/stores/useSimulationStore";
import { simulate } from "@/lib/simulation";

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function HistoryPanel() {
  const designs = useHistoryStore((s) => s.designs);
  const removeDesign = useHistoryStore((s) => s.remove);
  const clearAll = useHistoryStore((s) => s.clear);
  const setDesign = useDesignStore((s) => s.setDesign);
  const setNodes = useDesignStore((s) => s.setNodes);
  const simConfig = useSimulationStore((s) => s.config);
  const setSimResult = useSimulationStore((s) => s.setResult);

  const [confirmClear, setConfirmClear] = useState(false);

  const loadDesign = (saved: SavedDesign) => {
    setDesign({
      nodes: saved.nodes,
      edges: saved.edges,
      trafficEstimation: saved.trafficEstimation,
      explanation: saved.explanation,
      prompt: saved.prompt,
      name: saved.name,
    });

    // Re-run simulation
    const result = simulate(saved.nodes, saved.edges, simConfig);
    setSimResult(result);

    // Apply metrics
    const nodesWithMetrics = saved.nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        status: result.nodeMetrics[node.id]?.status ?? "healthy",
        metrics: result.nodeMetrics[node.id]
          ? {
              utilization: result.nodeMetrics[node.id].utilization,
              currentRps: result.nodeMetrics[node.id].currentRps,
              currentLatency: result.nodeMetrics[node.id].currentLatency,
            }
          : undefined,
      },
    }));
    setNodes(nodesWithMetrics as typeof saved.nodes);
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <History className="w-3.5 h-3.5" />
            History
            {designs.length > 0 && (
              <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-0.5">
                {designs.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[360px] p-0">
          <SheetHeader className="p-4 pb-2">
            <SheetTitle className="text-sm flex items-center gap-2">
              <History className="w-4 h-4" />
              Design History
            </SheetTitle>
            <SheetDescription className="text-xs">
              Your saved designs are stored locally in this browser.
            </SheetDescription>
          </SheetHeader>

          {designs.length > 0 && (
            <div className="px-4 pb-2">
              <Button
                variant="ghost"
                size="xs"
                className="text-destructive hover:text-destructive gap-1"
                onClick={() => setConfirmClear(true)}
              >
                <Trash2 className="w-3 h-3" />
                Clear all
              </Button>
            </div>
          )}

          <Separator />

          <ScrollArea className="flex-1 h-[calc(100vh-140px)]">
            {designs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <History className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No saved designs</p>
                <p className="text-xs mt-1">
                  Generate a design and it will appear here
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {designs.map((design) => (
                  <div
                    key={design.id}
                    className="group p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {design.name || design.prompt}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1 py-0"
                          >
                            {design.nodes.length} nodes
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {timeAgo(design.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => loadDesign(design)}
                          title="Load design"
                        >
                          <Upload className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeDesign(design.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Confirm clear dialog */}
      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Clear All History
            </DialogTitle>
            <DialogDescription>
              This will permanently delete all {designs.length} saved designs
              from your browser. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearAll();
                setConfirmClear(false);
              }}
            >
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
