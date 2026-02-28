"use client";

import React, { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "./nodes";
import { edgeTypes } from "./edges/CustomEdge";
import { useDesignStore } from "@/stores/useDesignStore";
import { COMPONENT_REGISTRY } from "@/lib/templates/registry";
import type { ComponentType } from "@/types/components";

const miniMapNodeColor = (node: { data?: { type?: string; status?: string } }) => {
  if (node.data?.status === "bottleneck" || node.data?.status === "overloaded")
    return "#ef4444";
  if (node.data?.status === "warning") return "#eab308";

  const type = node.data?.type as ComponentType | undefined;
  if (type && COMPONENT_REGISTRY[type]) {
    const colors: Record<string, string> = {
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
    return colors[type] ?? "#94a3b8";
  }
  return "#94a3b8";
};

export function DesignCanvas() {
  const nodes = useDesignStore((s) => s.nodes);
  const edges = useDesignStore((s) => s.edges);
  const onNodesChange = useDesignStore((s) => s.onNodesChange);
  const onEdgesChange = useDesignStore((s) => s.onEdgesChange);
  const setSelectedNodeId = useDesignStore((s) => s.setSelectedNodeId);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-gray-50 dark:bg-neutral-950"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#d1d5db"
          className="dark:opacity-20"
        />
        <Controls
          className="!bg-white dark:!bg-neutral-800 !border-gray-200 dark:!border-neutral-700 !shadow-lg !rounded-lg"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={miniMapNodeColor}
          className="!bg-white dark:!bg-neutral-800 !border-gray-200 dark:!border-neutral-700 !shadow-lg !rounded-lg"
          maskColor="rgba(0,0,0,0.1)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
