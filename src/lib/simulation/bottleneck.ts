/**
 * Bottleneck Detection Algorithm
 *
 * Traverses the system graph and computes per-node utilization,
 * flagging components that are under stress.
 */

import type { DesignNode, DesignEdge } from "@/types/design";
import type { ComponentType, ComponentStatus } from "@/types/components";
import type { NodeSimMetrics } from "@/types/simulation";
import { calculateQueueMetrics } from "./queuing";
import { calculateProcessingLatency } from "./latency";
import { COMPONENT_REGISTRY } from "@/lib/templates/registry";

interface NodeTraffic {
  incomingRps: number;
  outgoingRps: number;
}

/**
 * Calculate the effective RPS at each node by traversing the graph
 */
function calculateNodeTraffic(
  nodes: DesignNode[],
  edges: DesignEdge[],
  totalRps: number
): Map<string, NodeTraffic> {
  const traffic = new Map<string, NodeTraffic>();

  // Initialize all nodes
  for (const node of nodes) {
    traffic.set(node.id, { incomingRps: 0, outgoingRps: 0 });
  }

  // Find client/entry nodes (nodes with no incoming edges)
  const targetNodes = new Set(edges.map((e) => e.target));
  const entryNodes = nodes.filter((n) => !targetNodes.has(n.id));

  // Set entry node traffic
  for (const entry of entryNodes) {
    const t = traffic.get(entry.id)!;
    t.incomingRps = totalRps / Math.max(entryNodes.length, 1);
    t.outgoingRps = t.incomingRps;
  }

  // Build adjacency list
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
    adjacency.get(edge.source)!.push(edge.target);
  }

  // BFS to propagate traffic
  const visited = new Set<string>();
  const queue = [...entryNodes.map((n) => n.id)];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const nodeData = nodes.find((n) => n.id === nodeId)?.data;
    const t = traffic.get(nodeId)!;

    // Cache nodes absorb some traffic
    let passThrough = t.incomingRps;
    if (nodeData?.type === "cache" || nodeData?.type === "cdn") {
      const hitRate = nodeData.params.cacheHitRate ?? 0.85;
      passThrough = t.incomingRps * (1 - hitRate);
    }

    // Distribute to children
    const children = adjacency.get(nodeId) || [];
    for (const childId of children) {
      const childTraffic = traffic.get(childId)!;
      childTraffic.incomingRps += passThrough / Math.max(children.length, 1);
      childTraffic.outgoingRps = childTraffic.incomingRps;
      queue.push(childId);
    }
  }

  return traffic;
}

/**
 * Detect bottlenecks across all nodes in the system
 */
export function detectBottlenecks(
  nodes: DesignNode[],
  edges: DesignEdge[],
  totalRps: number
): Record<string, NodeSimMetrics> {
  const traffic = calculateNodeTraffic(nodes, edges, totalRps);
  const metrics: Record<string, NodeSimMetrics> = {};

  for (const node of nodes) {
    const nodeTraffic = traffic.get(node.id);
    const incomingRps = nodeTraffic?.incomingRps ?? 0;

    const type = node.data.type as ComponentType;
    const template = COMPONENT_REGISTRY[type];
    const params = node.data.params;

    const capacity = (params.throughputRps ?? template.defaultParams.throughputRps ?? 5000);
    const replicas = params.replicas ?? template.defaultParams.replicas ?? 1;
    const baseLatency = params.latencyMs ?? template.defaultParams.latencyMs ?? 10;

    const totalCapacity = capacity * replicas;
    const utilization = totalCapacity > 0 ? incomingRps / totalCapacity : 0;

    // Use queuing model for latency
    const queueMetrics = calculateQueueMetrics(
      incomingRps,
      capacity,
      replicas
    );

    const currentLatency = queueMetrics.isStable
      ? calculateProcessingLatency(baseLatency, utilization)
      : Infinity;

    // Determine status
    let status: ComponentStatus;
    if (utilization > 0.95) status = "overloaded";
    else if (utilization > 0.8) status = "bottleneck";
    else if (utilization > 0.6) status = "warning";
    else status = "healthy";

    metrics[node.id] = {
      utilization: Math.min(utilization, 1),
      currentRps: Math.round(incomingRps),
      currentLatency: currentLatency === Infinity ? 99999 : Math.round(currentLatency),
      queueLength: Math.round(queueMetrics.avgQueueLength),
      status,
    };
  }

  return metrics;
}

/**
 * Find the primary bottleneck in the system
 */
export function findPrimaryBottleneck(
  metrics: Record<string, NodeSimMetrics>,
  nodes: DesignNode[]
): string {
  let maxUtilization = 0;
  let bottleneckId = "none";

  for (const [nodeId, metric] of Object.entries(metrics)) {
    if (metric.utilization > maxUtilization) {
      maxUtilization = metric.utilization;
      bottleneckId = nodeId;
    }
  }

  if (maxUtilization < 0.6) return "none";

  const node = nodes.find((n) => n.id === bottleneckId);
  return node?.data.label ?? bottleneckId;
}
