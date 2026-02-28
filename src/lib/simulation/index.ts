/**
 * Unified Simulation Runner
 *
 * Orchestrates all sub-models: queuing, latency, bottleneck detection,
 * and scaling curves. Returns a complete SimulationResult.
 */

import type { DesignNode, DesignEdge, SimulationConfig } from "@/types/design";
import type { SimulationResult, NodeSimMetrics } from "@/types/simulation";
import { detectBottlenecks, findPrimaryBottleneck } from "./bottleneck";
import { estimateP99 } from "./latency";
import {
  generateScalingCurve,
  generateLatencyVsLoad,
  getScalingParamsForType,
} from "./scaling";
import { COMPONENT_REGISTRY } from "@/lib/templates/registry";
import type { ComponentType } from "@/types/components";

function getTrafficMultiplier(
  config: SimulationConfig,
  _timeStep: number
): number {
  switch (config.trafficPattern) {
    case "constant":
      return 1;
    case "spike":
      return config.spikeMultiplier ?? 3;
    case "gradual_ramp":
      return 1; // Caller handles ramp
    case "diurnal":
      return 1; // Simplified
    default:
      return 1;
  }
}

export function simulate(
  nodes: DesignNode[],
  edges: DesignEdge[],
  config: SimulationConfig
): SimulationResult {
  if (nodes.length === 0) {
    return emptyResult();
  }

  const multiplier = getTrafficMultiplier(config, 0);
  const totalRps = config.usersPerSecond * multiplier;

  // 1. Detect bottlenecks (computes per-node metrics)
  const nodeMetrics = detectBottlenecks(nodes, edges, totalRps);

  // 2. Calculate system-level metrics
  const allMetrics = Object.values(nodeMetrics);
  const serverNodes = allMetrics.filter(
    (m) => m.currentRps > 0
  );

  const avgLatencyMs = serverNodes.length > 0
    ? Math.round(
        serverNodes.reduce((sum, m) => sum + m.currentLatency, 0) /
          serverNodes.length
      )
    : 0;

  const p99LatencyMs = Math.round(estimateP99(avgLatencyMs));

  // 3. Calculate throughput (limited by the bottleneck)
  const maxUtilization = Math.max(...allMetrics.map((m) => m.utilization), 0);
  const throughputRps =
    maxUtilization >= 1
      ? Math.round(totalRps * 0.7)
      : Math.round(totalRps * Math.min(1, 1 / (1 + maxUtilization * 0.1)));

  // 4. Calculate DB and cache QPS
  const dbQps = calculateTypeQps(nodes, nodeMetrics, "database");
  const cacheQps = calculateTypeQps(nodes, nodeMetrics, "cache");

  // 5. Find primary bottleneck
  const bottleneck = findPrimaryBottleneck(nodeMetrics, nodes);

  // 6. Estimate monthly cost
  const estimatedMonthlyCost = estimateMonthlyCost(nodes);

  // 7. Find saturation point
  const saturationPoint = findSaturationPoint(nodes, edges);

  // 8. Generate scaling data (based on the primary bottleneck node type)
  const bottleneckNode = findBottleneckNodeType(nodeMetrics, nodes);
  const scalingParams = getScalingParamsForType(bottleneckNode);
  const scalingData = generateScalingCurve(scalingParams, 30);

  // 9. Generate latency vs load data
  const systemCapacity = scalingParams.baseCapacity * 3; // Assume 3 replicas
  const latencyDistribution = generateLatencyVsLoad(
    totalRps * 2,
    systemCapacity,
    scalingParams.baseLatencyMs
  );

  return {
    avgLatencyMs,
    p99LatencyMs,
    throughputRps,
    dbQps,
    cacheQps,
    bottleneck,
    estimatedMonthlyCost,
    saturationPoint,
    nodeMetrics,
    scalingData,
    latencyDistribution,
  };
}

function calculateTypeQps(
  nodes: DesignNode[],
  metrics: Record<string, NodeSimMetrics>,
  type: ComponentType
): number {
  return nodes
    .filter((n) => n.data.type === type)
    .reduce((sum, n) => sum + (metrics[n.id]?.currentRps ?? 0), 0);
}

function estimateMonthlyCost(nodes: DesignNode[]): number {
  return nodes.reduce((total, node) => {
    const type = node.data.type as ComponentType;
    const template = COMPONENT_REGISTRY[type];
    const replicas = node.data.params.replicas ?? template.defaultParams.replicas ?? 1;
    const costPerHour =
      node.data.params.costPerHourUsd ??
      template.defaultParams.costPerHourUsd ??
      0.1;
    // 730 hours per month
    return total + costPerHour * 730 * replicas;
  }, 0);
}

function findSaturationPoint(
  nodes: DesignNode[],
  edges: DesignEdge[]
): number {
  // Binary search for the RPS that causes any node to hit 85% utilization
  let low = 0;
  let high = 1000000;

  for (let i = 0; i < 20; i++) {
    const mid = Math.round((low + high) / 2);
    const metrics = detectBottlenecks(nodes, edges, mid);
    const maxUtil = Math.max(...Object.values(metrics).map((m) => m.utilization), 0);

    if (maxUtil > 0.85) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return Math.round(low);
}

function findBottleneckNodeType(
  metrics: Record<string, NodeSimMetrics>,
  nodes: DesignNode[]
): string {
  let maxUtil = 0;
  let bottleneckType = "microservice";

  for (const [nodeId, metric] of Object.entries(metrics)) {
    if (metric.utilization > maxUtil) {
      maxUtil = metric.utilization;
      const node = nodes.find((n) => n.id === nodeId);
      bottleneckType = node?.data.type ?? "microservice";
    }
  }

  return bottleneckType;
}

function emptyResult(): SimulationResult {
  return {
    avgLatencyMs: 0,
    p99LatencyMs: 0,
    throughputRps: 0,
    dbQps: 0,
    cacheQps: 0,
    bottleneck: "none",
    estimatedMonthlyCost: 0,
    saturationPoint: 0,
    nodeMetrics: {},
    scalingData: [],
    latencyDistribution: [],
  };
}
